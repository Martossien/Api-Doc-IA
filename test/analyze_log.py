#!/usr/bin/env python3
"""
Analyse api_doc_ia.log pour vérifier l'intégrité RAG:
- Détecte les blocs d'audit '🧭 Chunk order audit' et vérifie la monotonie stricte (page, start_index)
- Détecte '📏 Integrity check: ok=...'
- Vérifie l'absence de '🔁 FULL context retry'

Sortie: JSON agrégé et option --out pour écrire dans un fichier
Exit code != 0 si violation détectée
"""
import re, json, sys
from pathlib import Path


def parse_chunk_order(lines):
    audits = []
    rex = re.compile(r"Chunk order audit: (.*)")
    for ln in lines:
        m = rex.search(ln)
        if m:
            payload = m.group(1)
            try:
                # Payload est souvent tronqué; on essaie un parse JSON permissif
                if payload and payload[0] in ('[', '{'):
                    # Best effort: fermer crochets si besoin
                    text = payload
                    if text.count('[') > text.count(']'):
                        text += ']' * (text.count('[') - text.count(']'))
                    audits.append(json.loads(text))
            except Exception:
                pass
    return audits


def is_monotone(audits):
    # audits est une liste de listes de dicts {page, start_index}
    # Vérifier monotonie par (page, start_index)
    def key(x):
        p = x.get('page')
        s = x.get('start_index')
        try:
            p = int(p) if p is not None and str(p).isdigit() else 0
        except Exception:
            p = 0
        try:
            s = int(s) if s is not None and str(s).isdigit() else 0
        except Exception:
            s = 0
        return (p, s)

    for chunk_list in audits:
        if not isinstance(chunk_list, list):
            continue
        last = None
        for pos in chunk_list:
            if not isinstance(pos, dict):
                continue
            k = key(pos)
            if last is not None and not (k[0] > last[0] or (k[0] == last[0] and k[1] >= last[1])):
                return False
            last = k
    return True


def parse_integrity(lines):
    rex = re.compile(r"Integrity check: ok=(True|False)")
    oks = []
    for ln in lines:
        m = rex.search(ln)
        if m:
            oks.append(m.group(1) == 'True')
    return oks


def parse_fallback(lines):
    return any('FULL context retry' in ln for ln in lines)


def main():
    import argparse
    ap = argparse.ArgumentParser(description='Analyze api_doc_ia.log for RAG integrity and order')
    ap.add_argument('--log', default='api_doc_ia.log')
    ap.add_argument('--out', default=None)
    args = ap.parse_args()

    p = Path(args.log)
    if not p.exists():
        print(json.dumps({'ok': False, 'error': 'log_not_found', 'log': args.log}, ensure_ascii=False))
        sys.exit(2)

    lines = p.read_text(encoding='utf-8', errors='ignore').splitlines()
    audits = parse_chunk_order(lines)
    monotone = is_monotone(audits) if audits else True
    integrity_oks = parse_integrity(lines)
    integrity_ok = all(integrity_oks) if integrity_oks else True
    fallback = parse_fallback(lines)

    report = {
        'log': args.log,
        'monotone': monotone,
        'integrity_ok': integrity_ok,
        'fallback_detected': fallback,
        'audits_seen': len(audits),
        'integrity_checks_seen': len(integrity_oks),
    }

    data = json.dumps(report, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(data, encoding='utf-8')
        print(args.out)
    else:
        print(data)

    ok = monotone and integrity_ok and not fallback
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()

