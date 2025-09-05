#!/usr/bin/env python3
"""
Analyse de la réponse LLM reçue
"""
import re

def analyze_llm_response():
    llm_response = """DEBUT_DOC_001
MARK_000001
MARK_000002
MARK_000003
MARK_000004
MARK_000005
MARK_000006
MARK_000007
MARK_000008
MARK_000009
MARK_000010
MARK_000011
MARK_000012
MARK_000013
MARK_000014
MARK_000015
MARK_000016
MARK_050001
MARK_080001
MARK_100001
MARK_140001
MARK_150001
MARK_180001
MARK_190001
MARK_185000
MARK_800000
MARK_850000
MARK_100000
MARK_000004
MARK_000005
MARK_000006
MARK_000010
MARK_000016
MARK_080001
MARK_000006
MARK_080001
MARK_800000
MARK_850000
MARK_100000
FIN_DOC_001"""

    # Extraire tous les marqueurs
    patterns = [
        r'DEBUT_DOC_\d+',
        r'MARK_\d+(?:_OCTETS?_\d+)?',
        r'FIN_DOC_\d+'
    ]
    
    all_markers = []
    for pattern in patterns:
        matches = re.findall(pattern, llm_response)
        all_markers.extend(matches)
    
    unique_markers = set(all_markers)
    
    print("🔍 === ANALYSE DE LA RÉPONSE LLM ===\n")
    print(f"📊 Marqueurs totaux: {len(all_markers)}")
    print(f"📊 Marqueurs uniques: {len(unique_markers)}")
    print(f"📊 Doublons: {len(all_markers) - len(unique_markers)}")
    
    print(f"\n❌ === PROBLÈMES IDENTIFIÉS ===")
    
    # Problème 1: Mauvais numéro de document
    wrong_doc = [m for m in all_markers if "DOC_001" in m]
    if wrong_doc:
        print(f"1. MAUVAIS DOCUMENT: Trouve DOC_001 au lieu de DOC_003")
        print(f"   Marqueurs avec DOC_001: {len(wrong_doc)}")
    
    # Problème 2: Format des marqueurs incorrect
    expected_format = r'MARK_\d+_OCTETS_003'
    correct_format = [m for m in all_markers if re.match(expected_format, m)]
    print(f"2. FORMAT INCORRECT: {len(correct_format)} marqueurs au bon format sur {len(all_markers)}")
    
    # Problème 3: Doublons massifs
    duplicates = len(all_markers) - len(unique_markers)
    if duplicates > 0:
        print(f"3. DOUBLONS MASSIFS: {duplicates} doublons détectés")
    
    # Problème 4: Marqueurs attendus vs trouvés
    expected_markers = {
        'DEBUT_DOC_003',
        'FIN_DOC_003'
    }
    for i in range(5000, 190000, 5000):
        expected_markers.add(f'MARK_{i}_OCTETS_003')
    
    print(f"4. MARQUEURS ATTENDUS: {len(expected_markers)} vs {len(unique_markers)} trouvés")
    
    print(f"\n🎯 === CONCLUSION ===")
    print("❌ ÉCHEC CRITIQUE: Le LLM reçoit des données corrompues/mélangées")
    print("❌ Le fichier PDF analysé n'est PAS le bon (DOC_001 vs DOC_003)")
    print("❌ Les marqueurs sont dans un format incorrect")
    print("❌ Il y a contamination entre différents documents")

if __name__ == "__main__":
    analyze_llm_response()