import zipfile
from xml.etree import ElementTree as ET
from typing import List, Optional

from langchain_core.documents import Document

# MIMEs officiels OpenDocument
OPENDOCUMENT_MIMES = {
    "odt": "application/vnd.oasis.opendocument.text",
    "ods": "application/vnd.oasis.opendocument.spreadsheet",
    "odp": "application/vnd.oasis.opendocument.presentation",
}

# Détections optionnelles (fallback gracieux)
try:
    from odfdo import Document as ODFDocument  # type: ignore
    HAS_ODFDO = True
except Exception:
    HAS_ODFDO = False

try:
    import odf  # type: ignore  # noqa: F401 (sonde présence odfpy)
    HAS_ODFPY = True
except Exception:
    HAS_ODFPY = False


class OpenDocumentNativeLoader:
    """Extraction native pour formats OpenDocument (ODT/ODS/ODP), avec fallbacks.

    Ordre des fallbacks:
      1) odfdo si disponible (extraction plus riche)
      2) odfpy si disponible (à implémenter si nécessaire)
      3) zip+xml générique (content.xml) – robuste et sans dépendances

    Retourne une liste de Documents avec métadonnées enrichies.
    """

    def __init__(self, file_path: str, mime_type: Optional[str] = None):
        self.file_path = file_path
        self.mime_type = mime_type
        self.ext = self._guess_ext()

    def _guess_ext(self) -> str:
        lower = self.file_path.lower()
        for ext in ("odt", "ods", "odp"):
            if lower.endswith("." + ext):
                return ext
        # Approx. depuis mime
        if self.mime_type:
            for ext, m in OPENDOCUMENT_MIMES.items():
                if self.mime_type.startswith(m):
                    return ext
        return "odt"

    # ---------------------------
    # Fallbacks ZIP/XML génériques
    # ---------------------------
    def _read_content_xml(self) -> bytes:
        try:
            with zipfile.ZipFile(self.file_path, "r") as zf:
                with zf.open("content.xml") as f:
                    return f.read()
        except KeyError:
            raise ValueError("Invalid OpenDocument file: missing content.xml")
        except Exception as e:
            raise ValueError(f"Failed to read OpenDocument: {e}")

    def _collect_text_generic(self, node: ET.Element, texts: List[str]):
        if node.text and node.text.strip():
            texts.append(node.text.strip())
        for child in list(node):
            self._collect_text_generic(child, texts)
        if node.tail and node.tail.strip():
            texts.append(node.tail.strip())

    def _extract_generic_odt(self, xml_bytes: bytes) -> List[Document]:
        root = ET.fromstring(xml_bytes)
        texts: List[str] = []
        self._collect_text_generic(root, texts)
        text = "\n".join(t for t in (s.strip() for s in texts) if t) or "<No text content found>"
        return [
            Document(
                page_content=text,
                metadata={"Content-Type": OPENDOCUMENT_MIMES["odt"], "format": "odt", "section": "paragraph"},
            )
        ]

    def _extract_generic_ods(self, xml_bytes: bytes) -> List[Document]:
        # Découper par feuille (table:name)
        ns_strip = lambda tag: tag.split("}")[-1]
        root = ET.fromstring(xml_bytes)
        docs: List[Document] = []
        for table in root.iter():
            if ns_strip(table.tag) == "table":
                sheet_name = None
                for k, v in (table.attrib or {}).items():
                    if k.endswith("}name"):
                        sheet_name = v
                        break
                texts: List[str] = []
                self._collect_text_generic(table, texts)
                content = "\n".join(t for t in (s.strip() for s in texts) if t) or "<No text content found>"
                docs.append(
                    Document(
                        page_content=content,
                        metadata={
                            "Content-Type": OPENDOCUMENT_MIMES["ods"],
                            "format": "ods",
                            "section": "table",
                            "sheet_name": sheet_name or "Sheet",
                        },
                    )
                )
        if not docs:
            # Fallback: tout le document
            return [
                Document(
                    page_content=self._extract_generic_odt(xml_bytes)[0].page_content,
                    metadata={"Content-Type": OPENDOCUMENT_MIMES["ods"], "format": "ods", "section": "table"},
                )
            ]
        return docs

    def _extract_generic_odp(self, xml_bytes: bytes) -> List[Document]:
        # Découper par slide (draw:page)
        root = ET.fromstring(xml_bytes)
        ns_strip = lambda tag: tag.split("}")[-1]
        docs: List[Document] = []
        slide_num = 0
        for page in root.iter():
            if ns_strip(page.tag) == "page":
                slide_num += 1
                texts: List[str] = []
                self._collect_text_generic(page, texts)
                content = "\n".join(t for t in (s.strip() for s in texts) if t) or "<No text content found>"
                docs.append(
                    Document(
                        page_content=content,
                        metadata={
                            "Content-Type": OPENDOCUMENT_MIMES["odp"],
                            "format": "odp",
                            "section": "slide",
                            "slide_number": slide_num,
                        },
                    )
                )
        if not docs:
            return [
                Document(
                    page_content=self._extract_generic_odt(xml_bytes)[0].page_content,
                    metadata={"Content-Type": OPENDOCUMENT_MIMES["odp"], "format": "odp", "section": "slide"},
                )
            ]
        return docs

    # ---------------------------
    # odfdo (meilleur effort, fallback si erreur)
    # ---------------------------
    def _extract_with_odfdo(self) -> List[Document]:
        try:
            doc = ODFDocument(self.file_path)  # type: ignore
            text = doc.get_text()  # odfdo propose une extraction texte globale
            fmt = self.ext
            mime = OPENDOCUMENT_MIMES.get(fmt, OPENDOCUMENT_MIMES["odt"])
            return [
                Document(
                    page_content=(text or "").strip() or "<No text content found>",
                    metadata={"Content-Type": mime, "format": fmt, "section": "paragraph"},
                )
            ]
        except Exception:
            # Repli vers zip+xml
            xml_bytes = self._read_content_xml()
            return self._extract_by_ext_generic(xml_bytes)

    def _extract_by_ext_generic(self, xml_bytes: bytes) -> List[Document]:
        if self.ext == "odt":
            return self._extract_generic_odt(xml_bytes)
        if self.ext == "ods":
            return self._extract_generic_ods(xml_bytes)
        if self.ext == "odp":
            return self._extract_generic_odp(xml_bytes)
        return self._extract_generic_odt(xml_bytes)

    # ---------------------------
    # API publique
    # ---------------------------
    def load(self) -> List[Document]:
        if HAS_ODFDO:
            return self._extract_with_odfdo()
        # odfpy: non implémenté ici – passer directement au fallback générique
        xml_bytes = self._read_content_xml()
        return self._extract_by_ext_generic(xml_bytes)


# Backward compatibility
ODT_MIME = OPENDOCUMENT_MIMES["odt"]
OdtNativeLoader = OpenDocumentNativeLoader
