import requests
import logging
import ftfy
import sys
import time

from langchain_community.document_loaders import (
    AzureAIDocumentIntelligenceLoader,
    BSHTMLLoader,
    CSVLoader,
    Docx2txtLoader,
    OutlookMessageLoader,
    PyPDFLoader,
    TextLoader,
    UnstructuredEPubLoader,
    UnstructuredExcelLoader,
    UnstructuredMarkdownLoader,
    UnstructuredPowerPointLoader,
    UnstructuredRSTLoader,
    UnstructuredWordDocumentLoader,
    UnstructuredXMLLoader,
    YoutubeLoader,
)
from langchain_core.documents import Document

from open_webui.retrieval.loaders.mistral import MistralLoader
try:
    # Nouveau loader OpenDocument (avec compat OdtNativeLoader)
    from open_webui.retrieval.loaders.odt_loader import (
        OpenDocumentNativeLoader,
        OdtNativeLoader,
        OPENDOCUMENT_MIMES,
        ODT_MIME,
    )
except Exception:
    ODT_MIME = "application/vnd.oasis.opendocument.text"
    OPENDOCUMENT_MIMES = {
        "odt": ODT_MIME,
        "ods": "application/vnd.oasis.opendocument.spreadsheet",
        "odp": "application/vnd.oasis.opendocument.presentation",
    }

    class OpenDocumentNativeLoader:
        def __init__(self, file_path: str, mime_type: str | None = None):
            self.file_path = file_path
            self.mime_type = mime_type

        def load(self):
            raise ImportError(
                "OpenDocument loader not available. Add 'open_webui.retrieval.loaders.odt_loader'."
            )

    # Backwards compat alias
    OdtNativeLoader = OpenDocumentNativeLoader

try:
    from open_webui.retrieval.loaders.epub_loader import EbookLibLoader
except Exception:
    class EbookLibLoader:
        def __init__(self, file_path: str):
            self.file_path = file_path

        def load(self):
            # Fallback ultime — UnstructuredEPubLoader sera utilisé plus tard si disponible
            from langchain_community.document_loaders import UnstructuredEPubLoader

            return UnstructuredEPubLoader(self.file_path).load()

from open_webui.env import SRC_LOG_LEVELS, GLOBAL_LOG_LEVEL

logging.basicConfig(stream=sys.stdout, level=GLOBAL_LOG_LEVEL)
log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["RAG"])

known_source_ext = [
    "go",
    "py",
    "java",
    "sh",
    "bat",
    "ps1",
    "cmd",
    "js",
    "ts",
    "css",
    "cpp",
    "hpp",
    "h",
    "c",
    "cs",
    "sql",
    "log",
    "ini",
    "pl",
    "pm",
    "r",
    "dart",
    "dockerfile",
    "env",
    "php",
    "hs",
    "hsc",
    "lua",
    "nginxconf",
    "conf",
    "m",
    "mm",
    "plsql",
    "perl",
    "rb",
    "rs",
    "db2",
    "scala",
    "bash",
    "swift",
    "vue",
    "svelte",
    "msg",
    "ex",
    "exs",
    "erl",
    "tsx",
    "jsx",
    "hs",
    "lhs",
    "json",
]


class TikaLoader:
    def __init__(self, url, file_path, mime_type=None):
        self.url = url
        self.file_path = file_path
        self.mime_type = mime_type

    def load(self) -> list[Document]:
        """Extrait le texte via Apache Tika avec logs détaillés.

        Ajoute des métriques de timing et des informations de contexte pour
        faciliter le diagnostic des échecs d'extraction.
        """
        start_ts = time.perf_counter()
        with open(self.file_path, "rb") as f:
            data = f.read()

        if self.mime_type is not None:
            headers = {"Content-Type": self.mime_type}
        else:
            headers = {}

        endpoint = self.url
        if not endpoint.endswith("/"):
            endpoint += "/"
        endpoint += "tika/text"

        r = requests.put(endpoint, data=data, headers=headers)

        duration = time.perf_counter() - start_ts
        if r.ok:
            try:
                raw_metadata = r.json()
            except Exception:
                raw_metadata = {}
            text = raw_metadata.get("X-TIKA:content", "<No text content found>").strip()

            if "Content-Type" in raw_metadata:
                headers["Content-Type"] = raw_metadata["Content-Type"]

            log.info(
                f"[EXTRACTION] Tika: status=ok | bytes={len(data)} | mime={self.mime_type or headers.get('Content-Type','unknown')} | duration={duration:.2f}s | chars={len(text)}"
            )

            return [Document(page_content=text, metadata=headers)]
        else:
            preview = (r.text or "")[:300]
            log.error(
                f"[EXTRACTION] Tika: status=error | code={r.status_code} | reason={r.reason} | duration={duration:.2f}s | preview={preview}"
            )
            raise Exception(f"Error calling Tika: {r.reason}")


class DoclingLoader:
    def __init__(self, url, file_path=None, mime_type=None):
        self.url = url.rstrip("/")
        self.file_path = file_path
        self.mime_type = mime_type

    def load(self) -> list[Document]:
        """Extrait le texte via Docling avec logs détaillés et métriques.

        Retourne un Document avec le contenu markdown lorsque possible.
        """
        start_ts = time.perf_counter()
        with open(self.file_path, "rb") as f:
            files = {
                "files": (
                    self.file_path,
                    f,
                    self.mime_type or "application/octet-stream",
                )
            }

            params = {
                "image_export_mode": "placeholder",
                "table_mode": "accurate",
            }

            endpoint = f"{self.url}/v1alpha/convert/file"
            r = requests.post(endpoint, files=files, data=params)

        duration = time.perf_counter() - start_ts
        if r.ok:
            try:
                result = r.json()
            except Exception:
                result = {}
            document_data = result.get("document", {})
            text = document_data.get("md_content", "<No text content found>")

            metadata = {"Content-Type": self.mime_type} if self.mime_type else {}

            log.info(
                f"[EXTRACTION] Docling: status=ok | mime={self.mime_type or 'unknown'} | duration={duration:.2f}s | chars={len(text)}"
            )

            return [Document(page_content=text, metadata=metadata)]
        else:
            error_msg = f"Error calling Docling API: {r.reason}"
            if r.text:
                try:
                    error_data = r.json()
                    if "detail" in error_data:
                        error_msg += f" - {error_data['detail']}"
                except Exception:
                    error_msg += f" - {r.text}"
            log.error(
                f"[EXTRACTION] Docling: status=error | code={r.status_code} | reason={r.reason} | duration={duration:.2f}s | detail={(r.text or '')[:300]}"
            )
            raise Exception(f"Error calling Docling: {error_msg}")


class Loader:
    def __init__(self, engine: str = "", **kwargs):
        self.engine = engine
        self.kwargs = kwargs

    def load(
        self, filename: str, file_content_type: str, file_path: str
    ) -> list[Document]:
        loader = self._get_loader(filename, file_content_type, file_path)
        log.info(
            f"[EXTRACTION] Loader sélectionné: {loader.__class__.__name__} | engine={self.engine or 'auto'} | filename={filename} | content_type={file_content_type}"
        )
        docs = loader.load()

        return [
            Document(
                page_content=ftfy.fix_text(doc.page_content), metadata=doc.metadata
            )
            for doc in docs
        ]

    def _is_text_file(self, file_ext: str, file_content_type: str) -> bool:
        return file_ext in known_source_ext or (
            file_content_type and file_content_type.find("text/") >= 0
        )
    
    def _get_pdf_loader_robust(self, file_path: str, file_content_type: str):
        """
        Extraction PDF robuste avec stratégies de fallback multiples.
        
        Cette méthode implémente une approche en cascade pour extraire le contenu des PDF,
        en privilégiant l'extraction d'images quand possible, mais en fallback vers
        l'extraction texte uniquement si les images sont corrompues.
        
        Stratégies (dans l'ordre) :
        1. PyPDFLoader avec images (si configuré)
        2. PyPDFLoader sans images (fallback si images corrompues)
        3. Alternative pymupdf (si disponible)
        4. Alternative pdfplumber (si disponible)  
        5. Emergency text-only extraction
        
        Args:
            file_path: Chemin vers le fichier PDF
            file_content_type: Type MIME du fichier
            
        Returns:
            Loader approprié avec stratégie de fallback intégrée
        """
        
        class RobustPdfLoader:
            """Wrapper qui implémente les stratégies de fallback PDF."""
            
            def __init__(self, file_path: str, extract_images_config: bool, engine_config: dict):
                self.file_path = file_path
                self.extract_images_config = extract_images_config
                self.engine_config = engine_config
                
            def load(self):
                """Méthode principale d'extraction avec stratégies de fallback."""
                strategies = [
                    ('pypdf_with_images', self._try_pypdf_with_images),
                    ('pypdf_text_only', self._try_pypdf_text_only),
                    ('pymupdf_fallback', self._try_pymupdf),
                    ('pdfplumber_fallback', self._try_pdfplumber),
                    ('emergency_text_only', self._try_emergency_text)
                ]
                
                last_error = None
                for strategy_name, strategy_func in strategies:
                    try:
                        log.info(f"🔄 EXTRACTION PDF: Tentative {strategy_name} pour {self.file_path}")
                        start_time = time.time()
                        docs = strategy_func()
                        duration = time.time() - start_time
                        
                        if docs and len(docs) > 0:
                            total_chars = sum(len(doc.page_content) for doc in docs)
                            log.info(f"✅ EXTRACTION PDF RÉUSSIE: {strategy_name} | durée={duration:.2f}s | pages={len(docs)} | chars={total_chars}")
                            
                            # Ajouter métadonnées sur la stratégie utilisée
                            for doc in docs:
                                if not hasattr(doc, 'metadata'):
                                    doc.metadata = {}
                                doc.metadata['extraction_strategy'] = strategy_name
                                doc.metadata['extraction_duration'] = duration
                                doc.metadata['fallback_applied'] = strategy_name != 'pypdf_with_images'
                            
                            return docs
                        else:
                            log.warning(f"⚠️ EXTRACTION PDF VIDE: {strategy_name} - aucun contenu récupéré")
                            
                    except Exception as e:
                        last_error = e
                        log.warning(f"⚠️ EXTRACTION PDF ÉCHEC: {strategy_name} - {str(e)[:200]}")
                        # On continue avec la stratégie suivante
                        continue
                
                # Si toutes les stratégies ont échoué
                log.error(f"❌ EXTRACTION PDF: Toutes les stratégies ont échoué pour {self.file_path}")
                log.error(f"   Dernière erreur: {last_error}")
                raise Exception(f"PDF extraction failed with all strategies. Last error: {last_error}")
                
            def _try_pypdf_with_images(self):
                """Stratégie 1: PyPDFLoader avec extraction d'images (configuration standard)."""
                if not self.extract_images_config:
                    # Si les images ne sont pas configurées, passer directement à la stratégie suivante
                    raise Exception("Images extraction not configured, skipping")
                return PyPDFLoader(self.file_path, extract_images=True).load()
            
            def _try_pypdf_text_only(self):
                """Stratégie 2: PyPDFLoader sans extraction d'images (fallback principal)."""
                return PyPDFLoader(self.file_path, extract_images=False).load()
            
            def _try_pymupdf(self):
                """Stratégie 3: Alternative avec pymupdf/fitz si disponible."""
                try:
                    import fitz  # PyMuPDF
                    from langchain_core.documents import Document
                    
                    docs = []
                    doc = fitz.open(self.file_path)
                    for page_num in range(len(doc)):
                        page = doc.load_page(page_num)
                        text = page.get_text()
                        if text.strip():  # Ignorer les pages vides
                            docs.append(Document(
                                page_content=text,
                                metadata={
                                    "source": self.file_path,
                                    "page": page_num + 1
                                }
                            ))
                    doc.close()
                    return docs
                except ImportError:
                    raise Exception("pymupdf not available")
            
            def _try_pdfplumber(self):
                """Stratégie 4: Alternative avec pdfplumber si disponible."""
                try:
                    import pdfplumber
                    from langchain_core.documents import Document
                    
                    docs = []
                    with pdfplumber.open(self.file_path) as pdf:
                        for page_num, page in enumerate(pdf.pages):
                            text = page.extract_text()
                            if text and text.strip():  # Ignorer les pages vides
                                docs.append(Document(
                                    page_content=text,
                                    metadata={
                                        "source": self.file_path,
                                        "page": page_num + 1
                                    }
                                ))
                    return docs
                except ImportError:
                    raise Exception("pdfplumber not available")
            
            def _try_emergency_text(self):
                """Stratégie 5: Extraction d'urgence avec pypdf de base (sans images, minimal)."""
                try:
                    import pypdf
                    from langchain_core.documents import Document
                    
                    docs = []
                    with open(self.file_path, 'rb') as file:
                        pdf_reader = pypdf.PdfReader(file)
                        for page_num, page in enumerate(pdf_reader.pages):
                            try:
                                text = page.extract_text()
                                if text and text.strip():
                                    docs.append(Document(
                                        page_content=text,
                                        metadata={
                                            "source": self.file_path,
                                            "page": page_num + 1
                                        }
                                    ))
                            except Exception as page_error:
                                log.warning(f"Page {page_num + 1} extraction failed: {page_error}")
                                continue  # Ignorer cette page mais continuer avec les autres
                    return docs
                except ImportError:
                    raise Exception("pypdf not available for emergency extraction")
        
        # Configuration de l'extraction d'images
        extract_images = self.kwargs.get("PDF_EXTRACT_IMAGES", False)
        
        # Créer et retourner le loader robuste
        return RobustPdfLoader(
            file_path=file_path, 
            extract_images_config=extract_images,
            engine_config=self.kwargs
        )

    def _get_loader(self, filename: str, file_content_type: str, file_path: str):
        file_ext = filename.split(".")[-1].lower()

        # Support explicite OpenDocument (ODT/ODS/ODP)
        if (
            file_ext in ["odt", "ods", "odp"]
            or (file_content_type and file_content_type.startswith("application/vnd.oasis.opendocument"))
        ):
            # Priorité à l'engine explicitement demandé (comportement existant conservé)
            if self.engine == "tika" and self.kwargs.get("TIKA_SERVER_URL"):
                return TikaLoader(
                    url=self.kwargs.get("TIKA_SERVER_URL"),
                    file_path=file_path,
                    mime_type=file_content_type
                    or OPENDOCUMENT_MIMES.get(file_ext, ODT_MIME),
                )
            if self.engine == "docling" and self.kwargs.get("DOCLING_SERVER_URL"):
                return DoclingLoader(
                    url=self.kwargs.get("DOCLING_SERVER_URL"),
                    file_path=file_path,
                    mime_type=file_content_type
                    or OPENDOCUMENT_MIMES.get(file_ext, ODT_MIME),
                )
            # Mode auto: natif OpenDocument (odfdo→odfpy→zip+xml)
            return OpenDocumentNativeLoader(file_path, mime_type=file_content_type)

        if self.engine == "tika" and self.kwargs.get("TIKA_SERVER_URL"):
            if self._is_text_file(file_ext, file_content_type):
                loader = TextLoader(file_path, autodetect_encoding=True)
            else:
                loader = TikaLoader(
                    url=self.kwargs.get("TIKA_SERVER_URL"),
                    file_path=file_path,
                    mime_type=file_content_type,
                )
        elif self.engine == "docling" and self.kwargs.get("DOCLING_SERVER_URL"):
            if self._is_text_file(file_ext, file_content_type):
                loader = TextLoader(file_path, autodetect_encoding=True)
            else:
                loader = DoclingLoader(
                    url=self.kwargs.get("DOCLING_SERVER_URL"),
                    file_path=file_path,
                    mime_type=file_content_type,
                )
        elif (
            self.engine == "document_intelligence"
            and self.kwargs.get("DOCUMENT_INTELLIGENCE_ENDPOINT") != ""
            and self.kwargs.get("DOCUMENT_INTELLIGENCE_KEY") != ""
            and (
                file_ext in ["pdf", "xls", "xlsx", "docx", "ppt", "pptx"]
                or file_content_type
                in [
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-powerpoint",
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ]
            )
        ):
            loader = AzureAIDocumentIntelligenceLoader(
                file_path=file_path,
                api_endpoint=self.kwargs.get("DOCUMENT_INTELLIGENCE_ENDPOINT"),
                api_key=self.kwargs.get("DOCUMENT_INTELLIGENCE_KEY"),
            )
        elif (
            self.engine == "mistral_ocr"
            and self.kwargs.get("MISTRAL_OCR_API_KEY") != ""
            and file_ext
            in ["pdf"]  # Mistral OCR currently only supports PDF and images
        ):
            loader = MistralLoader(
                api_key=self.kwargs.get("MISTRAL_OCR_API_KEY"), file_path=file_path
            )
        # OpenDocument natif (auto/fallback), si non capté plus haut
        elif (
            file_ext in ["odt", "ods", "odp"]
            or (file_content_type and file_content_type.startswith("application/vnd.oasis.opendocument"))
            or file_content_type == ODT_MIME
        ):
            loader = OpenDocumentNativeLoader(file_path, mime_type=file_content_type)
        elif file_ext == "epub" or file_content_type == "application/epub+zip":
            # EPUB prioritaire: EbookLibLoader, fallback Unstructured dans l'implémentation
            loader = EbookLibLoader(file_path)
        else:
            if file_ext == "doc" or file_content_type == "application/msword":
                # Support du format DOC legacy via Unstructured
                loader = UnstructuredWordDocumentLoader(file_path)
            elif file_ext == "pdf":
                # 🔧 EXTRACTION PDF ROBUSTE: Stratégies de fallback multiples
                loader = self._get_pdf_loader_robust(file_path, file_content_type)
            elif file_ext == "csv":
                loader = CSVLoader(file_path, autodetect_encoding=True)
            elif file_ext == "rst":
                loader = UnstructuredRSTLoader(file_path, mode="elements")
            elif file_ext == "xml":
                loader = UnstructuredXMLLoader(file_path)
            elif file_ext in ["htm", "html"]:
                loader = BSHTMLLoader(file_path, open_encoding="unicode_escape")
            elif file_ext == "md":
                loader = TextLoader(file_path, autodetect_encoding=True)
            elif file_content_type == "application/epub+zip":
                loader = UnstructuredEPubLoader(file_path)
            elif (
                file_content_type
                == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                or file_ext == "docx"
            ):
                loader = Docx2txtLoader(file_path)
            elif file_content_type in [
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ] or file_ext in ["xls", "xlsx", "xlsm"]:
                loader = UnstructuredExcelLoader(file_path)
            elif file_content_type in [
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ] or file_ext in ["ppt", "pptx"]:
                loader = UnstructuredPowerPointLoader(file_path)
            elif file_ext == "msg":
                loader = OutlookMessageLoader(file_path)
            elif self._is_text_file(file_ext, file_content_type):
                loader = TextLoader(file_path, autodetect_encoding=True)
            else:
                # Gestion explicite des formats non supportés
                if file_ext in ["png", "jpg", "jpeg", "gif", "bmp", "tiff", "webp"]:
                    log.warning(
                        f"[EXTRACTION] Format image détecté sans OCR: ext={file_ext} | content_type={file_content_type}"
                    )
                    raise ValueError(
                        f"Image format '{file_ext}' requires OCR engine (Tika/Docling/Document Intelligence)"
                    )
                elif file_ext in ["mp4", "avi", "mov", "mp3", "wav"]:
                    log.warning(
                        f"[EXTRACTION] Format média non supporté: ext={file_ext} | content_type={file_content_type}"
                    )
                    raise ValueError(
                        f"Media format '{file_ext}' not supported for text extraction"
                    )
                else:
                    # Fallback vers TextLoader pour formats texte inconnus
                    loader = TextLoader(file_path, autodetect_encoding=True)

        return loader
