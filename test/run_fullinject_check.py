#!/usr/bin/env python3
"""
Full-inject oracle (sans RAG):
- Extrait le texte localement (PDF/DOCX/TXT)
- Valide l’ordre des marqueurs directement sur le texte extrait

But: vérifier que l’extraction/concaténation stricte conserve l’ordre et les caractères
sans dépendre du retrieval ni du LLM.
"""
import sys
import re
import json
from pathlib import Path


def extract_text(path: str) -> str:
    p = Path(path)
    if p.suffix.lower() == ".pdf":
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(path)
            texts = []
            for page in doc:
                texts.append(page.get_text("text"))
            return "\n".join(texts)
        except Exception:
            pass
        # Fallback to pdfminer.six
        try:
            from pdfminer.high_level import extract_text as pdfminer_extract
            return pdfminer_extract(path)
        except Exception as e:
            raise RuntimeError(f"PDF extract failed: {e}")
    elif p.suffix.lower() in (".docx",):
        try:
            import docx
            d = docx.Document(path)
            return "\n".join([para.text for para in d.paragraphs])
        except Exception as e:
            raise RuntimeError(f"DOCX extract failed: {e}")
    else:
        # text-like
        return Path(path).read_text(encoding="utf-8")


def validate(text: str) -> dict:
    from validate_markers import extract_markers, check_order
    markers = extract_markers(text)
    ok, info = check_order(markers, None)
    return {"ok": ok, "markers_count": len(markers), "markers": markers, "info": info}


def main():
    import argparse
    ap = argparse.ArgumentParser(description="Full inject oracle validator (no RAG)")
    ap.add_argument("file", help="Path to input file")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--out", default=None, help="Directory to write JSON result")
    args = ap.parse_args()

    text = extract_text(args.file)
    res = validate(text)
    out = {"file": args.file, **res}
    if args.json:
        j = json.dumps(out, ensure_ascii=False, indent=2)
        if args.out:
            import os
            os.makedirs(args.out, exist_ok=True)
            outpath = os.path.join(args.out, f"full_{Path(args.file).stem}.json")
            Path(outpath).write_text(j, encoding="utf-8")
            print(outpath)
        else:
            print(j)
    else:
        print(f"Status: {'OK' if out['ok'] else 'FAIL'}; markers={out['markers_count']}")
        if not out["ok"]:
            print(json.dumps(out["info"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
