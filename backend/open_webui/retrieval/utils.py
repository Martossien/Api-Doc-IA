import logging
import os
from typing import Optional, Union

import requests
import hashlib
from concurrent.futures import ThreadPoolExecutor

from huggingface_hub import snapshot_download
from langchain.retrievers import ContextualCompressionRetriever, EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document

from open_webui.config import VECTOR_DB, RAG_HYBRID_SEARCH_MAX_WORKERS
from open_webui.retrieval.vector.connector import VECTOR_DB_CLIENT

from open_webui.models.users import UserModel
from open_webui.models.files import Files

from open_webui.retrieval.vector.main import GetResult


from open_webui.env import (
    SRC_LOG_LEVELS,
    OFFLINE_MODE,
    ENABLE_FORWARD_USER_INFO_HEADERS,
)
from open_webui.config import (
    RAG_EMBEDDING_QUERY_PREFIX,
    RAG_EMBEDDING_CONTENT_PREFIX,
    RAG_EMBEDDING_PREFIX_FIELD_NAME,
)

log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["RAG"])


from typing import Any

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.retrievers import BaseRetriever


class VectorSearchRetriever(BaseRetriever):
    collection_name: Any
    embedding_function: Any
    top_k: int

    def _get_relevant_documents(
        self,
        query: str,
        *,
        run_manager: CallbackManagerForRetrieverRun,
    ) -> list[Document]:
        result = VECTOR_DB_CLIENT.search(
            collection_name=self.collection_name,
            vectors=[self.embedding_function(query, RAG_EMBEDDING_QUERY_PREFIX)],
            limit=self.top_k,
        )

        ids = result.ids[0]
        metadatas = result.metadatas[0]
        documents = result.documents[0]

        results = []
        for idx in range(len(ids)):
            results.append(
                Document(
                    metadata=metadatas[idx],
                    page_content=documents[idx],
                )
            )
        return results


def query_doc(
    collection_name: str, query_embedding: list[float], k: int, user: UserModel = None
):
    try:
        log.debug(f"query_doc:doc {collection_name}")
        
        # Check if collection exists before querying
        if not VECTOR_DB_CLIENT.has_collection(collection_name):
            log.warning(f"Collection {collection_name} does not exist, skipping query")
            return None
        
        result = VECTOR_DB_CLIENT.search(
            collection_name=collection_name,
            vectors=[query_embedding],
            limit=k,
        )

        if result:
            log.info(f"query_doc:result {result.ids} {result.metadatas}")

        return result
    except Exception as e:
        log.exception(f"Error querying doc {collection_name} with limit {k}: {e}")
        raise e


def get_doc(collection_name: str, user: UserModel = None):
    try:
        log.debug(f"get_doc:doc {collection_name}")
        
        # Check if collection exists before getting
        if not VECTOR_DB_CLIENT.has_collection(collection_name):
            log.warning(f"Collection {collection_name} does not exist, skipping get")
            return None
        
        result = VECTOR_DB_CLIENT.get(collection_name=collection_name)

        if result:
            log.info(f"query_doc:result {result.ids} {result.metadatas}")

        return result
    except Exception as e:
        log.exception(f"Error getting doc {collection_name}: {e}")
        raise e


def query_doc_with_hybrid_search(
    collection_name: str,
    collection_result: GetResult,
    query: str,
    embedding_function,
    k: int,
    reranking_function,
    k_reranker: int,
    r: float,
) -> dict:
    try:
        log.debug(f"query_doc_with_hybrid_search:doc {collection_name}")
        bm25_retriever = BM25Retriever.from_texts(
            texts=collection_result.documents[0],
            metadatas=collection_result.metadatas[0],
        )
        bm25_retriever.k = k

        vector_search_retriever = VectorSearchRetriever(
            collection_name=collection_name,
            embedding_function=embedding_function,
            top_k=k,
        )

        ensemble_retriever = EnsembleRetriever(
            retrievers=[bm25_retriever, vector_search_retriever], weights=[0.5, 0.5]
        )
        compressor = RerankCompressor(
            embedding_function=embedding_function,
            top_n=k_reranker,
            reranking_function=reranking_function,
            r_score=r,
        )

        compression_retriever = ContextualCompressionRetriever(
            base_compressor=compressor, base_retriever=ensemble_retriever
        )

        result = compression_retriever.invoke(query)

        distances = [d.metadata.get("score") for d in result]
        documents = [d.page_content for d in result]
        metadatas = [d.metadata for d in result]

        # retrieve only min(k, k_reranker) items, sort and cut by distance if k < k_reranker
        if k < k_reranker:
            sorted_items = sorted(
                zip(distances, metadatas, documents), key=lambda x: x[0], reverse=True
            )
            sorted_items = sorted_items[:k]
            distances, documents, metadatas = map(list, zip(*sorted_items))

        result = {
            "distances": [distances],
            "documents": [documents],
            "metadatas": [metadatas],
        }

        log.info(
            "query_doc_with_hybrid_search:result "
            + f'{result["metadatas"]} {result["distances"]}'
        )
        return result
    except Exception as e:
        log.exception(f"Error querying doc {collection_name} with hybrid search: {e}")
        raise e


def merge_get_results(get_results: list[dict]) -> dict:
    # Initialize lists to store combined data
    combined_documents = []
    combined_metadatas = []
    combined_ids = []

    for data in get_results:
        combined_documents.extend(data["documents"][0])
        combined_metadatas.extend(data["metadatas"][0])
        combined_ids.extend(data["ids"][0])

    # Create the output dictionary
    result = {
        "documents": [combined_documents],
        "metadatas": [combined_metadatas],
        "ids": [combined_ids],
    }

    return result


def merge_and_sort_query_results(query_results: list[dict], k: int) -> dict:
    # Initialize lists to store combined data
    combined = dict()  # To store documents with unique document hashes

    for data in query_results:
        distances = data["distances"][0]
        documents = data["documents"][0]
        metadatas = data["metadatas"][0]

        for distance, document, metadata in zip(distances, documents, metadatas):
            if isinstance(document, str):
                doc_hash = hashlib.md5(
                    document.encode()
                ).hexdigest()  # Compute a hash for uniqueness

                if doc_hash not in combined.keys():
                    combined[doc_hash] = (distance, document, metadata)
                    continue  # if doc is new, no further comparison is needed

                # if doc is alredy in, but new distance is better, update
                if distance > combined[doc_hash][0]:
                    combined[doc_hash] = (distance, document, metadata)

    combined = list(combined.values())
    # Sort the list based on distances
    combined.sort(key=lambda x: x[0], reverse=True)

    # Slice to keep only the top k elements
    sorted_distances, sorted_documents, sorted_metadatas = (
        zip(*combined[:k]) if combined else ([], [], [])
    )

    # Create and return the output dictionary
    return {
        "distances": [list(sorted_distances)],
        "documents": [list(sorted_documents)],
        "metadatas": [list(sorted_metadatas)],
    }


def get_all_items_from_collections(collection_names: list[str]) -> dict:
    results = []

    for collection_name in collection_names:
        if collection_name:
            try:
                result = get_doc(collection_name=collection_name)
                if result is not None:
                    results.append(result.model_dump())
            except Exception as e:
                log.exception(f"Error when querying the collection: {e}")
        else:
            pass

    return merge_get_results(results)


def query_collection(
    collection_names: list[str],
    queries: list[str],
    embedding_function,
    k: int,
) -> dict:
    results = []
    for query in queries:
        log.debug(f"query_collection:query {query}")
        query_embedding = embedding_function(query, prefix=RAG_EMBEDDING_QUERY_PREFIX)
        for collection_name in collection_names:
            if collection_name:
                try:
                    result = query_doc(
                        collection_name=collection_name,
                        k=k,
                        query_embedding=query_embedding,
                    )
                    if result is not None:
                        results.append(result.model_dump())
                except Exception as e:
                    log.exception(f"Error when querying the collection: {e}")
            else:
                pass

    return merge_and_sort_query_results(results, k=k)


def query_collection_with_hybrid_search(
    collection_names: list[str],
    queries: list[str],
    embedding_function,
    k: int,
    reranking_function,
    k_reranker: int,
    r: float,
) -> dict:
    results = []
    error = False
    # Fetch collection data once per collection sequentially
    # Avoid fetching the same data multiple times later
    collection_results = {}
    for collection_name in collection_names:
        try:
            log.debug(
                f"query_collection_with_hybrid_search:VECTOR_DB_CLIENT.get:collection {collection_name}"
            )
            
            # Check if collection exists before fetching
            if not VECTOR_DB_CLIENT.has_collection(collection_name):
                log.warning(f"Collection {collection_name} does not exist, skipping hybrid search")
                collection_results[collection_name] = None
                continue
                
            collection_results[collection_name] = VECTOR_DB_CLIENT.get(
                collection_name=collection_name
            )
        except Exception as e:
            log.exception(f"Failed to fetch collection {collection_name}: {e}")
            collection_results[collection_name] = None

    log.info(
        f"Starting hybrid search for {len(queries)} queries in {len(collection_names)} collections..."
    )

    def process_query(collection_name, query):
        try:
            result = query_doc_with_hybrid_search(
                collection_name=collection_name,
                collection_result=collection_results[collection_name],
                query=query,
                embedding_function=embedding_function,
                k=k,
                reranking_function=reranking_function,
                k_reranker=k_reranker,
                r=r,
            )
            return result, None
        except Exception as e:
            log.exception(f"Error when querying the collection with hybrid_search: {e}")
            return None, e

    # Prepare tasks for all collections and queries
    # Avoid running any tasks for collections that failed to fetch data (have assigned None)
    tasks = [
        (cn, q)
        for cn in collection_names
        if collection_results[cn] is not None
        for q in queries
    ]

    with ThreadPoolExecutor(max_workers=RAG_HYBRID_SEARCH_MAX_WORKERS.value) as executor:
        logging.info(f"🔧 Hybrid Search ThreadPool started with max_workers={RAG_HYBRID_SEARCH_MAX_WORKERS.value}")
        future_results = [executor.submit(process_query, cn, q) for cn, q in tasks]
        task_results = [future.result() for future in future_results]

    for result, err in task_results:
        if err is not None:
            error = True
        elif result is not None:
            results.append(result)

    if error and not results:
        raise Exception(
            "Hybrid search failed for all collections. Using Non-hybrid search as fallback."
        )

    return merge_and_sort_query_results(results, k=k)


def get_embedding_function(
    embedding_engine,
    embedding_model,
    embedding_function,
    url,
    key,
    embedding_batch_size,
):
    if embedding_engine == "":
        return lambda query, prefix=None, user=None: embedding_function.encode(
            query, **({"prompt": prefix} if prefix else {})
        ).tolist()
    elif embedding_engine in ["ollama", "openai"]:
        func = lambda query, prefix=None, user=None: generate_embeddings(
            engine=embedding_engine,
            model=embedding_model,
            text=query,
            prefix=prefix,
            url=url,
            key=key,
            user=user,
        )

        def generate_multiple(query, prefix, user, func):
            if isinstance(query, list):
                embeddings = []
                for i in range(0, len(query), embedding_batch_size):
                    embeddings.extend(
                        func(
                            query[i : i + embedding_batch_size],
                            prefix=prefix,
                            user=user,
                        )
                    )
                return embeddings
            else:
                return func(query, prefix, user)

        return lambda query, prefix=None, user=None: generate_multiple(
            query, prefix, user, func
        )
    else:
        raise ValueError(f"Unknown embedding engine: {embedding_engine}")


# 🔧 WRAPPER INTELLIGENT - Fonction de détection API v2
def is_api_v2_request(request) -> bool:
    """
    Détecte si une requête provient de l'API v2 basée sur le path
    API v2 utilise le préfixe /api/v2/
    """
    if hasattr(request, 'url') and request.url:
        path = str(request.url.path)
        is_v2 = path.startswith('/api/v2/')
        log.debug(f"🔍 Request path: {path}, Is API v2: {is_v2}")
        return is_v2
    return False


# 🚀 WRAPPER INTELLIGENT - Fonction de sources intelligente
def get_sources_intelligent_wrapper(
    request,
    files,
    queries,
    embedding_function,
    k,
    reranking_function,
    k_reranker,
    r,
    hybrid_search,
    full_context=False,
    user: Optional[UserModel] = None,
):
    """
    Wrapper intelligent qui choisit la meilleure stratégie selon l'origine de la requête:
    - API v2: Utilise get_sources_from_files_original (stable, testée)
    - API v1 web: Utilise version améliorée avec meilleure gestion d'erreurs
    """
    is_v2 = is_api_v2_request(request)
    
    if is_v2:
        log.info("🚀 API v2 détectée - utilisation fonction originale stable")
        return get_sources_from_files_original(
            request=request,
            files=files,
            queries=queries,
            embedding_function=embedding_function,
            k=k,
            reranking_function=reranking_function,
            k_reranker=k_reranker,
            r=r,
            hybrid_search=hybrid_search,
            full_context=full_context,
        )
    else:
        log.info("🌐 API v1 web détectée - utilisation version améliorée")
        return get_sources_from_files_enhanced(
            request=request,
            files=files,
            queries=queries,
            embedding_function=embedding_function,
            k=k,
            reranking_function=reranking_function,
            k_reranker=k_reranker,
            r=r,
            hybrid_search=hybrid_search,
            full_context=full_context,
            user=user,
        )


# 🔄 FONCTION ORIGINALE RENOMMÉE - Pour API v2 (stable)
def get_sources_from_files_original(
    request,
    files,
    queries,
    embedding_function,
    k,
    reranking_function,
    k_reranker,
    r,
    hybrid_search,
    full_context=False,
):
    log.debug(
        f"files: {files} {queries} {embedding_function} {reranking_function} {full_context}"
    )

    extracted_collections = []
    relevant_contexts = []

    for file in files:

        context = None
        if file.get("docs"):
            # BYPASS_WEB_SEARCH_EMBEDDING_AND_RETRIEVAL
            context = {
                "documents": [[doc.get("content") for doc in file.get("docs")]],
                "metadatas": [[doc.get("metadata") for doc in file.get("docs")]],
            }
        elif file.get("context") == "full":
            # Manual Full Mode Toggle
            context = {
                "documents": [[file.get("file").get("data", {}).get("content")]],
                "metadatas": [[{"file_id": file.get("id"), "name": file.get("name")}]],
            }
        elif (
            file.get("type") != "web_search"
            and request.app.state.config.BYPASS_EMBEDDING_AND_RETRIEVAL
        ):
            # BYPASS_EMBEDDING_AND_RETRIEVAL
            if file.get("type") == "collection":
                file_ids = file.get("data", {}).get("file_ids", [])

                documents = []
                metadatas = []
                for file_id in file_ids:
                    file_object = Files.get_file_by_id(file_id)

                    if file_object:
                        documents.append(file_object.data.get("content", ""))
                        metadatas.append(
                            {
                                "file_id": file_id,
                                "name": file_object.filename,
                                "source": file_object.filename,
                            }
                        )

                context = {
                    "documents": [documents],
                    "metadatas": [metadatas],
                }

            elif file.get("id"):
                file_object = Files.get_file_by_id(file.get("id"))
                if file_object:
                    context = {
                        "documents": [[file_object.data.get("content", "")]],
                        "metadatas": [
                            [
                                {
                                    "file_id": file.get("id"),
                                    "name": file_object.filename,
                                    "source": file_object.filename,
                                }
                            ]
                        ],
                    }
            elif file.get("file").get("data"):
                context = {
                    "documents": [[file.get("file").get("data", {}).get("content")]],
                    "metadatas": [
                        [file.get("file").get("data", {}).get("metadata", {})]
                    ],
                }
        else:
            collection_names = []
            if file.get("type") == "collection":
                if file.get("legacy"):
                    collection_names = file.get("collection_names", [])
                else:
                    collection_names.append(file["id"])
            elif file.get("collection_name"):
                collection_names.append(file["collection_name"])
            elif file.get("id"):
                if file.get("legacy"):
                    collection_names.append(f"{file['id']}")
                else:
                    collection_names.append(f"file-{file['id']}")

            collection_names = set(collection_names).difference(extracted_collections)
            if not collection_names:
                log.debug(f"skipping {file} as it has already been extracted")
                continue

            if full_context:
                try:
                    context = get_all_items_from_collections(collection_names)
                except Exception as e:
                    log.exception(e)

            else:
                try:
                    context = None
                    if file.get("type") == "text":
                        context = file["content"]
                    else:
                        if hybrid_search:
                            try:
                                context = query_collection_with_hybrid_search(
                                    collection_names=collection_names,
                                    queries=queries,
                                    embedding_function=embedding_function,
                                    k=k,
                                    reranking_function=reranking_function,
                                    k_reranker=k_reranker,
                                    r=r,
                                )
                            except Exception as e:
                                log.debug(
                                    "Error when using hybrid search, using"
                                    " non hybrid search as fallback."
                                )

                        if (not hybrid_search) or (context is None):
                            context = query_collection(
                                collection_names=collection_names,
                                queries=queries,
                                embedding_function=embedding_function,
                                k=k,
                            )
                    # 🔍 RAG retrieval stats + small-coverage fallback
                    try:
                        import os as _os
                        from statistics import mean as _mean
                        docs = (context or {}).get("documents", [[]])[0]
                        metas = (context or {}).get("metadatas", [[]])[0]
                        dists = (context or {}).get("distances", [[]])[0]
                        chunks_included = len(docs) if isinstance(docs, list) else 0
                        avg_score = float(_mean(dists)) if isinstance(dists, list) and dists else 0.0
                        min_score = float(min(dists)) if isinstance(dists, list) and dists else 0.0
                        # total chunks in collections (if available)
                        total_chunks = 0
                        try:
                            for cn in collection_names:
                                gr = get_doc(collection_name=cn)
                                if gr is not None:
                                    total_chunks += len(gr.documents[0])
                        except Exception:
                            pass
                        # head/tail offsets (start_index) sample
                        sidx_order = []
                        if isinstance(metas, list):
                            for m in metas:
                                if isinstance(m, dict):
                                    v = m.get('start_index') or m.get('startIndex')
                                    try:
                                        sidx_order.append(int(v))
                                    except Exception:
                                        sidx_order.append(v)
                        head = sidx_order[:10]
                        tail = sidx_order[-10:]
                        log.info(
                            f"🧾 RAG audit: retrieval_stats chunks_included={chunks_included}, total_chunks_collections={total_chunks}, top_k={k}, avg_score={avg_score:.4f}, min_score={min_score:.4f}, head_sidx={head}, tail_sidx={tail}"
                        )
                        # Fallback if suspiciously low coverage on a large collection
                        try:
                            min_chunks = int(_os.getenv('RAG_MIN_CHUNKS_FALLBACK', '5'))
                            large_threshold = int(_os.getenv('RAG_LARGE_COLLECTION_MIN_CHUNKS', '50'))
                        except Exception:
                            min_chunks, large_threshold = 5, 50
                        if total_chunks >= large_threshold and chunks_included < min_chunks:
                            try:
                                fc = get_all_items_from_collections(collection_names)
                                if fc and (fc.get('documents', [[]])[0]):
                                    context = fc
                                    log.warning(
                                        f"🔁 RAG fallback_small_coverage applied: included={chunks_included} < {min_chunks} while total_chunks={total_chunks} >= {large_threshold}; switched to full_context for {list(collection_names)}"
                                    )
                            except Exception as _e:
                                log.exception(_e)
                    except Exception:
                        pass
                except Exception as e:
                    log.exception(e)

            extracted_collections.extend(collection_names)

        if context:
            if "data" in file:
                del file["data"]

            relevant_contexts.append({**context, "file": file})

    sources = []

    def _sort_and_dedupe_source(src: dict) -> dict:
        """Post-tri déterministe et dé-duplication pour préserver l'ordre d'apparition.
        Trie par (page/page_number/pageIndex, start_index/startIndex) puis index.
        Dé-duplique par (file_id, start_index) puis par hash du texte.
        """
        documents = list(src.get("document", []) or [])
        metadatas = list(src.get("metadata", []) or [])
        distances = list(src.get("distances", []) or [])
        if not documents or not metadatas:
            return src

        # Lightweight offset repair if start_index is missing or duplicated
        # Use Files.data.content to locate chunk text near the expected hint
        try:
            file_id = None
            for m in metadatas:
                if isinstance(m, dict) and m.get("file_id"):
                    file_id = m.get("file_id")
                    break
            full_text = None
            if file_id:
                fo = Files.get_file_by_id(file_id)
                if fo:
                    full_text = (fo.data or {}).get("content") or None
            repaired = 0
            repair_attempted = 0
            repair_ambiguous = 0
            window = 2048  # bounded search window
            if isinstance(full_text, str) and full_text:
                # Prepare naive pass to fill missing start_index based on neighbor hints
                for i, (doc, meta) in enumerate(zip(documents, metadatas)):
                    if not isinstance(meta, dict):
                        continue
                    s = meta.get("start_index") or meta.get("startIndex")
                    if s is None and isinstance(doc, str) and doc.strip():
                        repair_attempted += 1
                        # hint from previous known start_index
                        hint = None
                        # try to scope by same page when available
                        page_curr = meta.get("page") or meta.get("page_number") or meta.get("pageIndex")
                        # previous
                        for j in range(i - 1, -1, -1):
                            mj = metadatas[j] if isinstance(metadatas[j], dict) else {}
                            sj = mj.get("start_index") or mj.get("startIndex")
                            pj = mj.get("page") or mj.get("page_number") or mj.get("pageIndex")
                            if sj is not None and isinstance(documents[j], str):
                                try:
                                    if page_curr is None or pj == page_curr:
                                        hint = int(sj) + len(str(documents[j]))
                                        break
                                except Exception:
                                    pass
                        # search around hint if available, else global find (bounded cost)
                        if hint is not None:
                            start = max(0, hint - window)
                            pos = -1
                            for pref_len in (256, 128):
                                prefix = doc[:pref_len]
                                if not prefix:
                                    continue
                                pos = full_text.find(prefix, start)
                                if pos != -1:
                                    # ambiguity check: any other match nearby?
                                    pos2 = full_text.find(prefix, pos + 1)
                                    if pos2 != -1 and pos2 < start + window * 2:
                                        repair_ambiguous += 1
                                        pos = -1
                                        continue
                                    meta["start_index"] = pos
                                    repaired += 1
                                    break
                        else:
                            pos = -1
                            for pref_len in (256, 128):
                                prefix = doc[:pref_len]
                                if not prefix:
                                    continue
                                pos = full_text.find(prefix)
                                if pos != -1:
                                    pos2 = full_text.find(prefix, pos + 1)
                                    if pos2 == -1:
                                        meta["start_index"] = pos
                                        repaired += 1
                                        break
                                    else:
                                        repair_ambiguous += 1
                                        pos = -1
            # log attempted and ambiguous repairs
            if repair_attempted or repaired or repair_ambiguous:
                log.info(f"🧾 RAG audit: offset_repair attempted={repair_attempted}, repaired={repaired}, ambiguous={repair_ambiguous}")
        except Exception:
            pass
        tuples = []
        for i, (doc, meta) in enumerate(zip(documents, metadatas)):
            page = None
            start_idx = None
            fid = None
            chunk_seq = None
            if isinstance(meta, dict):
                page = meta.get("page") or meta.get("page_number") or meta.get("pageIndex")
                start_idx = meta.get("start_index") or meta.get("startIndex")
                fid = meta.get("file_id") or meta.get("fileId") or meta.get("fileID")
                # try common sequence fields; fallback to provided index
                chunk_seq = meta.get("chunk_seq") or meta.get("seq") or meta.get("index") or meta.get("chunkIndex")
            try:
                page_val = int(page) if page is not None and str(page).isdigit() else 0
            except Exception:
                page_val = 0
            try:
                sidx_val = int(start_idx) if start_idx is not None and str(start_idx).isdigit() else i
            except Exception:
                sidx_val = i
            try:
                seq_val = int(chunk_seq) if chunk_seq is not None and str(chunk_seq).isdigit() else i
            except Exception:
                seq_val = i
            fid_key = str(fid) if fid is not None else ""
            dist = distances[i] if i < len(distances) else None
            # Deterministic sort key: by file, page, start_index, then stable tie-breakers
            tuples.append(((fid_key, page_val, sidx_val, seq_val, i), doc, meta, dist))

        tuples.sort(key=lambda t: t[0])

        from collections import deque
        seen_keys = set()
        seen_hash = set()
        hash_order = deque()
        HASH_LRU_MAX = 10000
        removed_by_offset = 0
        removed_by_hash = 0
        ordered_docs, ordered_metas, ordered_dists = [], [], []
        import hashlib as _hl
        for _, doc, meta, dist in tuples:
            key = None
            if isinstance(meta, dict):
                fid = meta.get("file_id")
                sidx = meta.get("start_index") or meta.get("startIndex")
                if fid is not None and sidx is not None:
                    key = (fid, sidx)
            h = _hl.md5(str(doc).encode("utf-8", errors="ignore")).hexdigest()
            if key and key in seen_keys:
                removed_by_offset += 1
                continue
            if h in seen_hash:
                removed_by_hash += 1
                continue
            if key:
                seen_keys.add(key)
            seen_hash.add(h)
            hash_order.append(h)
            if len(hash_order) > HASH_LRU_MAX:
                old = hash_order.popleft()
                # safe discard
                try:
                    seen_hash.remove(old)
                except KeyError:
                    pass
            ordered_docs.append(doc)
            ordered_metas.append(meta)
            if distances:
                ordered_dists.append(dist)

        # Merge all ordered docs into a single context string to avoid splitting markers across chunk boundaries
        merged = "\n".join(str(d) for d in ordered_docs)
        new_src = {
            **{k: v for k, v in src.items() if k not in ("document", "metadata", "distances")},
            "document": [merged],
            "metadata": [ordered_metas[0] if ordered_metas else {}],
        }
        if distances:
            new_src["distances"] = ordered_dists
        return new_src

    for context in relevant_contexts:
        try:
            if "documents" in context:
                if "metadatas" in context:
                    source = {
                        "source": context["file"],
                        "document": context["documents"][0],
                        "metadata": context["metadatas"][0],
                    }
                    if "distances" in context and context["distances"]:
                        source["distances"] = context["distances"][0]

                    sources.append(_sort_and_dedupe_source(source))
        except Exception as e:
            log.exception(e)

    return sources


# 🚀 FONCTION ENHANCED - Pour API v1 web (avec améliorations)
def get_sources_from_files_enhanced(
    request,
    files,
    queries,
    embedding_function,
    k,
    reranking_function,
    k_reranker,
    r,
    hybrid_search,
    full_context=False,
    user: Optional[UserModel] = None,
):
    """
    Version améliorée de get_sources_from_files avec:
    - Meilleure gestion d'erreurs
    - Vérification d'existence des collections
    - Fallback automatique vers mode "full" si échec RAG
    - Logs détaillés pour debugging
    """
    log.debug(
        f"🔍 Enhanced files: {files} {queries} {embedding_function} {reranking_function} {full_context}"
    )
    log.info(f"🌐 Processing {len(files) if files else 0} files for web interface")
    # RAG audit: summarize files being processed (id, name, type, checksum if present)
    try:
        _files_info = []
        for _f in (files or []):
            _info = {
                "id": _f.get("id"),
                "name": _f.get("name"),
                "type": _f.get("type"),
            }
            try:
                _meta = (_f.get("file", {}) or {}).get("data", {}).get("metadata", {})
                if isinstance(_meta, dict) and _meta.get("checksum"):
                    _info["checksum"] = _meta.get("checksum")
            except Exception:
                pass
            _files_info.append(_info)
        import json as _json
        log.info(f"🧾 RAG audit: files={_json.dumps(_files_info, ensure_ascii=False)[:1000]}")
    except Exception:
        pass

    extracted_collections = []
    relevant_contexts = []

    for file_idx, file in enumerate(files):
        log.debug(f"📄 Processing file {file_idx + 1}/{len(files)}: {file.get('name', 'unknown')}")
        
        context = None
        if file.get("docs"):
            # BYPASS_WEB_SEARCH_EMBEDDING_AND_RETRIEVAL
            log.debug("📋 Using docs bypass mode")
            context = {
                "documents": [[doc.get("content") for doc in file.get("docs")]],
                "metadatas": [[doc.get("metadata") for doc in file.get("docs")]],
            }
        elif file.get("context") == "full":
            # Manual Full Mode Toggle - MOST RELIABLE FOR WEB
            log.info("🎯 Using FULL context mode - bypassing RAG for reliability")
            context = {
                "documents": [[file.get("file").get("data", {}).get("content")]],
                "metadatas": [[{"file_id": file.get("id"), "name": file.get("name")}]],
            }
        elif (
            file.get("type") != "web_search"
            and request.app.state.config.BYPASS_EMBEDDING_AND_RETRIEVAL
        ):
            # BYPASS_EMBEDDING_AND_RETRIEVAL
            log.debug("⚡ Using embedding bypass mode")
            if file.get("type") == "collection":
                file_ids = file.get("data", {}).get("file_ids", [])

                documents = []
                metadatas = []
                for file_id in file_ids:
                    file_object = Files.get_file_by_id(file_id)

                    if file_object:
                        documents.append(file_object.data.get("content", ""))
                        metadatas.append(
                            {
                                "file_id": file_id,
                                "name": file_object.filename,
                                "source": file_object.filename,
                            }
                        )

                context = {
                    "documents": [documents],
                    "metadatas": [metadatas],
                }

            elif file.get("id"):
                file_object = Files.get_file_by_id(file.get("id"))
                if file_object:
                    context = {
                        "documents": [[file_object.data.get("content", "")]],
                        "metadatas": [
                            [
                                {
                                    "file_id": file.get("id"),
                                    "name": file_object.filename,
                                    "source": file_object.filename,
                                }
                            ]
                        ],
                    }
            elif file.get("file").get("data"):
                context = {
                    "documents": [[file.get("file").get("data", {}).get("content")]],
                    "metadatas": [
                        [file.get("file").get("data", {}).get("metadata", {})]
                    ],
                }
        else:
            # RAG MODE with enhanced error handling
            collection_names = []
            if file.get("type") == "collection":
                if file.get("legacy"):
                    collection_names = file.get("collection_names", [])
                else:
                    collection_names.append(file["id"])
            elif file.get("collection_name"):
                collection_names.append(file["collection_name"])
            elif file.get("id"):
                if file.get("legacy"):
                    collection_names.append(f"{file['id']}")
                else:
                    collection_names.append(f"file-{file['id']}")

            collection_names = set(collection_names).difference(extracted_collections)
            if not collection_names:
                log.debug(f"⚠️ Skipping {file} as it has already been extracted")
                continue

            log.debug(f"🔍 RAG search for collections: {collection_names}")

            # 🚀 ENHANCED: Check collection existence before querying
            valid_collections = []
            for collection_name in collection_names:
                if VECTOR_DB_CLIENT.has_collection(collection_name):
                    valid_collections.append(collection_name)
                    log.debug(f"✅ Collection exists: {collection_name}")
                else:
                    log.warning(f"❌ Collection missing: {collection_name}")

            if not valid_collections:
                log.warning(f"⚠️ No valid collections found for file {file.get('name')}")
                # 🚀 FALLBACK: Try to get content directly from database
                if file.get("id"):
                    log.info("🔄 Fallback: Attempting direct file content retrieval")
                    try:
                        file_object = Files.get_file_by_id(file.get("id"))
                        if file_object and file_object.data.get("content"):
                            log.info("✅ Fallback successful - using direct content")
                            context = {
                                "documents": [[file_object.data.get("content", "")]],
                                "metadatas": [
                                    [
                                        {
                                            "file_id": file.get("id"),
                                            "name": file_object.filename,
                                            "source": file_object.filename,
                                        }
                                    ]
                                ],
                            }
                        else:
                            log.error("❌ Fallback failed - no content available")
                    except Exception as e:
                        log.error(f"❌ Fallback exception: {e}")
                continue

            # Use valid collections only
            collection_names = valid_collections

            if full_context:
                try:
                    log.debug("📖 Using full context retrieval")
                    context = get_all_items_from_collections(collection_names)
                    try:
                        total_chunks = len(context.get('ids', [[]])[0]) if context and context.get('ids') else 0
                        log.info(f"🧾 RAG audit: full_context total_chunks={total_chunks}")
                    except Exception:
                        pass
                except Exception as e:
                    log.exception(f"❌ Full context retrieval failed: {e}")

            else:
                try:
                    context = None
                    if file.get("type") == "text":
                        context = file["content"]
                    else:
                        if hybrid_search:
                            try:
                                log.debug("🔄 Attempting hybrid search")
                                context = query_collection_with_hybrid_search(
                                    collection_names=collection_names,
                                    queries=queries,
                                    embedding_function=embedding_function,
                                    k=k,
                                    reranking_function=reranking_function,
                                    k_reranker=k_reranker,
                                    r=r,
                                )
                                if context:
                                    log.debug("✅ Hybrid search successful")
                            except Exception as e:
                                log.warning(f"⚠️ Hybrid search failed, falling back: {e}")

                        if (not hybrid_search) or (context is None):
                            log.debug("🔄 Using standard vector search")
                            context = query_collection(
                                collection_names=collection_names,
                                queries=queries,
                                embedding_function=embedding_function,
                                k=k,
                            )
                            if context:
                                log.debug("✅ Standard vector search successful")
                            else:
                                log.warning("⚠️ Standard vector search returned no results")
                        try:
                            n_before = len(context.get('documents',[[]])[0]) if context else 0
                            log.info(f"🧾 RAG audit: retrieval_k={k}, returned_chunks={n_before}")
                        except Exception:
                            pass
                except Exception as e:
                    log.exception(f"❌ RAG search failed completely: {e}")

            extracted_collections.extend(collection_names)

        if context:
            if "data" in file:
                del file["data"]

            relevant_contexts.append({**context, "file": file})
            log.debug(f"✅ Context added for file: {file.get('name')}")
        else:
            log.warning(f"❌ No context found for file: {file.get('name')}")

    # Build sources with enhanced validation
    sources = []

    def _sort_and_dedupe_source(src: dict) -> dict:
        """Post-tri déterministe et dé-duplication pour préserver l'ordre d'apparition.
        Trie par (page/page_number/pageIndex, start_index/startIndex) puis index.
        Dé-duplique par (file_id, start_index) puis par hash du texte.
        """
        documents = list(src.get("document", []) or [])
        metadatas = list(src.get("metadata", []) or [])
        distances = list(src.get("distances", []) or [])
        if not documents or not metadatas:
            return src
        tuples = []
        for i, (doc, meta) in enumerate(zip(documents, metadatas)):
            page = None
            start_idx = None
            if isinstance(meta, dict):
                page = meta.get("page") or meta.get("page_number") or meta.get("pageIndex")
                start_idx = meta.get("start_index") or meta.get("startIndex")
            # fallback to stable index if missing
            try:
                page_val = int(page) if page is not None and str(page).isdigit() else 0
            except Exception:
                page_val = 0
            try:
                sidx_val = int(start_idx) if start_idx is not None and str(start_idx).isdigit() else i
            except Exception:
                sidx_val = i
            dist = distances[i] if i < len(distances) else None
            tuples.append(((page_val, sidx_val, i), doc, meta, dist))

        tuples.sort(key=lambda t: t[0])

        seen_keys = set()
        seen_hash = set()
        ordered_docs, ordered_metas, ordered_dists = [], [], []
        import hashlib as _hl
        for _, doc, meta, dist in tuples:
            key = None
            if isinstance(meta, dict):
                fid = meta.get("file_id")
                sidx = meta.get("start_index") or meta.get("startIndex")
                if fid is not None and sidx is not None:
                    key = (fid, sidx)
            h = _hl.md5(str(doc).encode("utf-8", errors="ignore")).hexdigest()
            if (key and key in seen_keys) or h in seen_hash:
                continue
            if key:
                seen_keys.add(key)
            seen_hash.add(h)
            ordered_docs.append(doc)
            ordered_metas.append(meta)
            if distances:
                ordered_dists.append(dist)

        # Merge anti-overlap: exact match trimming only; otherwise concatenate as-is (zero loss)
        max_overlap_check = 512
        overlaps_encountered = 0
        overlaps_trimmed = 0
        overlaps_mismatch = 0
        merged_parts = []
        last_start = None
        last_text = ""
        for i, (doc, meta) in enumerate(zip(ordered_docs, ordered_metas)):
            text = str(doc)
            s = None
            if isinstance(meta, dict):
                s = meta.get("start_index") or meta.get("startIndex")
                try:
                    s = int(s) if s is not None else None
                except Exception:
                    s = None
            if i == 0 or last_start is None or s is None:
                merged_parts.append(text)
            else:
                prev_end = last_start + len(last_text)
                overlap = prev_end - s
                if overlap > 0:
                    overlaps_encountered += 1
                    o = min(overlap, max_overlap_check, len(last_text), len(text))
                    if o > 0 and last_text[-o:] == text[:o]:
                        merged_parts.append(text[o:])
                        # update current start_index by trimmed overlap to keep offsets consistent
                        if isinstance(meta, dict):
                            try:
                                current_s = meta.get("start_index") or meta.get("startIndex")
                                if current_s is not None:
                                    current_s = int(current_s)
                                    meta["start_index"] = current_s + o
                            except Exception:
                                pass
                        overlaps_trimmed += 1
                    else:
                        merged_parts.append(text)
                        overlaps_mismatch += 1
                else:
                    merged_parts.append(text)
            last_start = s if s is not None else last_start
            last_text = text
        merged_doc = "\n".join(merged_parts)
        try:
            import re
            from collections import Counter as _Counter
            pat = re.compile(r"(DEBUT_[A-Z0-9_]+|MARK_[A-Z0-9_]+|FIN_[A-Z0-9_]+)")
            mm = len(pat.findall(merged_doc))
            log.info(f"🧾 RAG audit: post-tri dedupe chunks_before={len(documents)}, after={len(ordered_docs)}, markers_in_merged={mm}")
            if ordered_metas:
                first = ordered_metas[0]
                last = ordered_metas[-1]
                log.info(f"🧭 RAG audit: first_offset=(p={first.get('page') or first.get('page_number') or first.get('pageIndex')}, s={first.get('start_index') or first.get('startIndex')}), last_offset=(p={last.get('page') or last.get('page_number') or last.get('pageIndex')}, s={last.get('start_index') or last.get('startIndex')})")

            # Overlap and delta(start_index) diagnostics (no behavior change)
            overlaps_detected = 0
            overlaps_matched = 0
            overlaps_mismatch = 0
            max_overlap = 0
            delta_counter = _Counter()
            for i in range(1, len(ordered_metas)):
                prev_m = ordered_metas[i - 1] if isinstance(ordered_metas[i - 1], dict) else {}
                curr_m = ordered_metas[i] if isinstance(ordered_metas[i], dict) else {}
                ps = prev_m.get("start_index") or prev_m.get("startIndex")
                cs = curr_m.get("start_index") or curr_m.get("startIndex")
                try:
                    ps_i = int(ps) if ps is not None else None
                    cs_i = int(cs) if cs is not None else None
                except Exception:
                    ps_i = ps
                    cs_i = cs
                if isinstance(ps_i, int) and isinstance(cs_i, int):
                    delta_counter[cs_i - ps_i] += 1
                    prev_doc = str(ordered_docs[i - 1]) if i - 1 < len(ordered_docs) else ""
                    curr_doc = str(ordered_docs[i]) if i < len(ordered_docs) else ""
                    prev_end = ps_i + len(prev_doc)
                    overlap = prev_end - cs_i
                    if overlap > 0:
                        overlaps_detected += 1
                        if overlap > max_overlap:
                            max_overlap = overlap
                        # Bound overlap to available lengths
                        o = min(overlap, len(prev_doc), len(curr_doc))
                        if o > 0:
                            if prev_doc[-o:] == curr_doc[:o]:
                                overlaps_matched += 1
                            else:
                                overlaps_mismatch += 1
            if delta_counter:
                # Log top 8 most common deltas (chunk step/stride insight)
                top_deltas = sorted(delta_counter.items(), key=lambda kv: kv[1], reverse=True)[:8]
                log.info(
                    f"🧾 RAG audit: delta_start_index_top={top_deltas}, overlaps_detected={overlaps_detected}, overlaps_trim_like={overlaps_matched}, overlaps_mismatch={overlaps_mismatch}, max_overlap={max_overlap}"
                )
            # Max gap between consecutive offsets (after any trim updates)
            try:
                sidx_order = []
                for m in ordered_metas:
                    if isinstance(m, dict):
                        v = m.get('start_index') or m.get('startIndex')
                        sidx_order.append(int(v) if v is not None and str(v).isdigit() else None)
                gaps = []
                last = None
                for v in sidx_order:
                    if isinstance(v, int) and isinstance(last, int):
                        gaps.append(v - last)
                    last = v if isinstance(v, int) else last
                if gaps:
                    log.info(f"🧾 RAG audit: max_gap_between_consecutive_offsets={max(gaps)}")
            except Exception:
                pass
            # Also log anti-overlap trimming summary from merged parts
            log.info(
                f"🧾 RAG audit: anti_overlap_summary overlaps_encountered={overlaps_encountered}, overlaps_trimmed={overlaps_trimmed}, overlaps_mismatch={overlaps_mismatch}, max_overlap_checked={max_overlap_check}"
            )
            # Post-merge ordering and dedup stats
            try:
                ordered_sidx = []
                for m in ordered_metas:
                    if isinstance(m, dict):
                        s = m.get('start_index') or m.get('startIndex')
                        ordered_sidx.append(s)
                sample = (ordered_sidx[:12] + ['...'] + ordered_sidx[-12:]) if len(ordered_sidx) > 30 else ordered_sidx
                log.info(
                    f"🧾 RAG audit: dedupe_removed_by_offset={removed_by_offset}, dedupe_removed_by_hash={removed_by_hash}, ordered_start_index_sample={sample}"
                )
            except Exception:
                pass
        except Exception:
            pass
        new_src = {
            **{k: v for k, v in src.items() if k not in ("document", "metadata", "distances")},
            "document": [merged_doc],
            "metadata": [ordered_metas[0] if ordered_metas else {}],
        }
        if distances:
            new_src["distances"] = ordered_dists
        return new_src
    # Pre-merge audit: how many contexts and a sample of positions, plus offset metrics
    try:
        import json as _json
        _pos_audit = []
        total_metas = 0
        with_sidx = 0
        missing_sidx = 0
        with_page = 0
        missing_page = 0
        # For duplicate start_index accounting (regardless of page)
        _sidx_values = []
        for _ctx in (relevant_contexts or []):
            _metas = _ctx.get("metadatas", [[]])[0] if isinstance(_ctx.get("metadatas"), list) else []
            total_metas += len(_metas) if isinstance(_metas, list) else 0
            _sample = []
            for _m in list(_metas)[:10] + list(_metas)[-10:]:
                if isinstance(_m, dict):
                    p = _m.get("page") or _m.get("page_number") or _m.get("pageIndex")
                    s = _m.get("start_index") or _m.get("startIndex")
                    _sample.append({
                        "page": p,
                        "start_index": s,
                    })
            for _m in (_metas or []):
                if isinstance(_m, dict):
                    p = _m.get("page") or _m.get("page_number") or _m.get("pageIndex")
                    s = _m.get("start_index") or _m.get("startIndex")
                    if p is None:
                        missing_page += 1
                    else:
                        with_page += 1
                    if s is None:
                        missing_sidx += 1
                    else:
                        with_sidx += 1
                        try:
                            _sidx_values.append(int(s))
                        except Exception:
                            _sidx_values.append(s)
            _pos_audit.append(_sample)

        # Duplicate counts for start_index (ignoring None)
        try:
            _sidx_vals_only = [v for v in _sidx_values if v is not None]
            _unique = len(set(_sidx_vals_only))
            _dups = max(0, len(_sidx_vals_only) - _unique)
        except Exception:
            _unique = 0
            _dups = 0
        log.info(
            f"🧭 RAG audit: pre-merge contexts={len(relevant_contexts)} positions_sample={_json.dumps(_pos_audit)[:1000]}"
        )
        log.info(
            f"🧾 RAG audit: offsets total_metas={total_metas}, with_start_index={with_sidx}, start_index_missing={missing_sidx}, with_page={with_page}, page_missing={missing_page}, start_index_duplicates={_dups}"
        )
    except Exception:
        pass

    for context in relevant_contexts:
        try:
            if "documents" in context:
                if "metadatas" in context:
                    # 🚀 ENHANCED: Validate document content
                    documents = context["documents"][0] if context["documents"] else []
                    if documents:
                        total_content_length = sum(len(str(doc)) for doc in documents if doc)
                        log.debug(f"📊 Total content length: {total_content_length} chars")
                        
                        if total_content_length < 10:  # Minimum content threshold
                            log.warning(f"⚠️ Content too short ({total_content_length} chars), skipping")
                            continue

                    source = {
                        "source": context["file"],
                        "document": context["documents"][0],
                        "metadata": context["metadatas"][0],
                    }
                    if "distances" in context and context["distances"]:
                        source["distances"] = context["distances"][0]

                    sources.append(_sort_and_dedupe_source(source))
                    log.debug("✅ Source added successfully")
        except Exception as e:
            log.exception(f"❌ Error processing context: {e}")

    log.info(f"🎯 Enhanced processing complete: {len(sources)} sources extracted from {len(files)} files")
    return sources


# 🔧 BACKWARD COMPATIBILITY: Alias pour API v2 adapter
# API v2 importe directement get_sources_from_files - on maintient la compatibilité
get_sources_from_files = get_sources_from_files_original


def get_model_path(model: str, update_model: bool = False):
    # Construct huggingface_hub kwargs with local_files_only to return the snapshot path
    cache_dir = os.getenv("SENTENCE_TRANSFORMERS_HOME")

    local_files_only = not update_model

    if OFFLINE_MODE:
        local_files_only = True

    snapshot_kwargs = {
        "cache_dir": cache_dir,
        "local_files_only": local_files_only,
    }

    log.debug(f"model: {model}")
    log.debug(f"snapshot_kwargs: {snapshot_kwargs}")

    # Inspiration from upstream sentence_transformers
    if (
        os.path.exists(model)
        or ("\\" in model or model.count("/") > 1)
        and local_files_only
    ):
        # If fully qualified path exists, return input, else set repo_id
        return model
    elif "/" not in model:
        # Set valid repo_id for model short-name
        model = "sentence-transformers" + "/" + model

    snapshot_kwargs["repo_id"] = model

    # Attempt to query the huggingface_hub library to determine the local path and/or to update
    try:
        model_repo_path = snapshot_download(**snapshot_kwargs)
        log.debug(f"model_repo_path: {model_repo_path}")
        return model_repo_path
    except Exception as e:
        log.exception(f"Cannot determine model snapshot path: {e}")
        return model


def generate_openai_batch_embeddings(
    model: str,
    texts: list[str],
    url: str = "https://api.openai.com/v1",
    key: str = "",
    prefix: str = None,
    user: UserModel = None,
) -> Optional[list[list[float]]]:
    try:
        log.debug(
            f"generate_openai_batch_embeddings:model {model} batch size: {len(texts)}"
        )
        json_data = {"input": texts, "model": model}
        if isinstance(RAG_EMBEDDING_PREFIX_FIELD_NAME, str) and isinstance(prefix, str):
            json_data[RAG_EMBEDDING_PREFIX_FIELD_NAME] = prefix

        r = requests.post(
            f"{url}/embeddings",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
                **(
                    {
                        "X-OpenWebUI-User-Name": user.name,
                        "X-OpenWebUI-User-Id": user.id,
                        "X-OpenWebUI-User-Email": user.email,
                        "X-OpenWebUI-User-Role": user.role,
                    }
                    if ENABLE_FORWARD_USER_INFO_HEADERS and user
                    else {}
                ),
            },
            json=json_data,
        )
        r.raise_for_status()
        data = r.json()
        if "data" in data:
            return [elem["embedding"] for elem in data["data"]]
        else:
            raise "Something went wrong :/"
    except Exception as e:
        log.exception(f"Error generating openai batch embeddings: {e}")
        return None


def generate_ollama_batch_embeddings(
    model: str,
    texts: list[str],
    url: str,
    key: str = "",
    prefix: str = None,
    user: UserModel = None,
) -> Optional[list[list[float]]]:
    try:
        log.debug(
            f"generate_ollama_batch_embeddings:model {model} batch size: {len(texts)}"
        )
        json_data = {"input": texts, "model": model}
        if isinstance(RAG_EMBEDDING_PREFIX_FIELD_NAME, str) and isinstance(prefix, str):
            json_data[RAG_EMBEDDING_PREFIX_FIELD_NAME] = prefix

        r = requests.post(
            f"{url}/api/embed",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
                **(
                    {
                        "X-OpenWebUI-User-Name": user.name,
                        "X-OpenWebUI-User-Id": user.id,
                        "X-OpenWebUI-User-Email": user.email,
                        "X-OpenWebUI-User-Role": user.role,
                    }
                    if ENABLE_FORWARD_USER_INFO_HEADERS
                    else {}
                ),
            },
            json=json_data,
        )
        r.raise_for_status()
        data = r.json()

        if "embeddings" in data:
            return data["embeddings"]
        else:
            raise "Something went wrong :/"
    except Exception as e:
        log.exception(f"Error generating ollama batch embeddings: {e}")
        return None


def generate_embeddings(
    engine: str,
    model: str,
    text: Union[str, list[str]],
    prefix: Union[str, None] = None,
    **kwargs,
):
    url = kwargs.get("url", "")
    key = kwargs.get("key", "")
    user = kwargs.get("user")

    if prefix is not None and RAG_EMBEDDING_PREFIX_FIELD_NAME is None:
        if isinstance(text, list):
            text = [f"{prefix}{text_element}" for text_element in text]
        else:
            text = f"{prefix}{text}"

    if engine == "ollama":
        if isinstance(text, list):
            embeddings = generate_ollama_batch_embeddings(
                **{
                    "model": model,
                    "texts": text,
                    "url": url,
                    "key": key,
                    "prefix": prefix,
                    "user": user,
                }
            )
        else:
            embeddings = generate_ollama_batch_embeddings(
                **{
                    "model": model,
                    "texts": [text],
                    "url": url,
                    "key": key,
                    "prefix": prefix,
                    "user": user,
                }
            )
        return embeddings[0] if isinstance(text, str) else embeddings
    elif engine == "openai":
        if isinstance(text, list):
            embeddings = generate_openai_batch_embeddings(
                model, text, url, key, prefix, user
            )
        else:
            embeddings = generate_openai_batch_embeddings(
                model, [text], url, key, prefix, user
            )
        return embeddings[0] if isinstance(text, str) else embeddings


import operator
from typing import Optional, Sequence

from langchain_core.callbacks import Callbacks
from langchain_core.documents import BaseDocumentCompressor, Document


class RerankCompressor(BaseDocumentCompressor):
    embedding_function: Any
    top_n: int
    reranking_function: Any
    r_score: float

    class Config:
        extra = "forbid"
        arbitrary_types_allowed = True

    def compress_documents(
        self,
        documents: Sequence[Document],
        query: str,
        callbacks: Optional[Callbacks] = None,
    ) -> Sequence[Document]:
        reranking = self.reranking_function is not None

        if reranking:
            scores = self.reranking_function.predict(
                [(query, doc.page_content) for doc in documents]
            )
        else:
            from sentence_transformers import util

            query_embedding = self.embedding_function(query, RAG_EMBEDDING_QUERY_PREFIX)
            document_embedding = self.embedding_function(
                [doc.page_content for doc in documents], RAG_EMBEDDING_CONTENT_PREFIX
            )
            scores = util.cos_sim(query_embedding, document_embedding)[0]

        docs_with_scores = list(zip(documents, scores.tolist()))
        if self.r_score:
            docs_with_scores = [
                (d, s) for d, s in docs_with_scores if s >= self.r_score
            ]

        result = sorted(docs_with_scores, key=operator.itemgetter(1), reverse=True)
        final_results = []
        for doc, doc_score in result[: self.top_n]:
            metadata = doc.metadata
            metadata["score"] = doc_score
            doc = Document(
                page_content=doc.page_content,
                metadata=metadata,
            )
            final_results.append(doc)
        return final_results
