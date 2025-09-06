from typing import List

from langchain_core.documents import Document


class EbookLibLoader:
    """Extraction EPUB via ebooklib avec fallback 'unstructured'.

    - Si ebooklib est disponible: parse l'EPUB et extrait le texte des chapitres.
    - Sinon: fallback vers UnstructuredEPubLoader (si dispo via langchain).
    """

    def __init__(self, file_path: str):
        self.file_path = file_path

    def _extract_with_ebooklib(self) -> List[Document]:
        from ebooklib import epub  # type: ignore
        from bs4 import BeautifulSoup

        book = epub.read_epub(self.file_path)
        docs: List[Document] = []

        # Titre global (si présent)
        title = None
        try:
            titles = book.get_metadata("DC", "title")
            if titles:
                title = titles[0][0]
        except Exception:
            pass

        for i, item in enumerate(book.get_items_of_type(9), start=1):  # 9=DOCUMENT
            try:
                html = item.get_body_content().decode("utf-8", errors="ignore")
            except Exception:
                continue
            soup = BeautifulSoup(html, "html.parser")
            text = soup.get_text("\n").strip()
            if not text:
                continue
            meta = {
                "format": "epub",
                "section": "chapter",
                "chapter": getattr(item, "id", None) or f"chapter-{i}",
                "Content-Type": "application/epub+zip",
            }
            if title:
                meta["book_title"] = title
            docs.append(Document(page_content=text, metadata=meta))

        if not docs:
            docs.append(
                Document(
                    page_content="<No text content found>",
                    metadata={"format": "epub", "section": "chapter", "Content-Type": "application/epub+zip"},
                )
            )
        return docs

    def _fallback_unstructured(self) -> List[Document]:
        try:
            from langchain_community.document_loaders import UnstructuredEPubLoader  # type: ignore

            loader = UnstructuredEPubLoader(self.file_path)
            docs = loader.load()
            # Assurer métadonnées minimales
            out: List[Document] = []
            for d in docs:
                meta = dict(d.metadata or {})
                meta.setdefault("format", "epub")
                meta.setdefault("section", "chapter")
                meta.setdefault("Content-Type", "application/epub+zip")
                out.append(Document(page_content=d.page_content, metadata=meta))
            return out
        except Exception as e:
            return [
                Document(
                    page_content=f"<EPUB extraction not available: {e}>",
                    metadata={"format": "epub", "section": "chapter", "Content-Type": "application/epub+zip"},
                )
            ]

    def load(self) -> List[Document]:
        try:
            import ebooklib  # type: ignore  # noqa: F401

            return self._extract_with_ebooklib()
        except Exception:
            return self._fallback_unstructured()

