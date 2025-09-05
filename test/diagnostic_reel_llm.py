#!/usr/bin/env python3
"""
🔥 Diagnostic RÉEL du pipeline RAG - tracer ce que reçoit vraiment le LLM
"""
import os
import sys
import re
import json
from pathlib import Path

# Ajouter le chemin backend au PYTHONPATH
backend_path = Path(__file__).parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

# Configuration de l'environnement
os.environ['RAG_TOP_K'] = '300'
os.environ['RAG_FULL_CONTEXT'] = 'True'
os.environ['WEBUI_AUTH'] = 'False'

def extract_markers_from_text(text):
    """Extrait tous les marqueurs d'un texte"""
    if not isinstance(text, str):
        text = str(text)
    
    markers = []
    patterns = [
        r'DEBUT_DOC_\d+',
        r'MARK_\d+_OCTETS?_\d+',
        r'FIN_DOC_\d+'
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            markers.append(match)
    
    return markers

def trace_rag_pipeline():
    """Tracer le vrai pipeline RAG pour voir où se perdent les marqueurs"""
    print("🔍 === DIAGNOSTIC RÉEL DU PIPELINE RAG ===\n")
    
    # Étape 1: Importer les vraies fonctions utilisées par le système
    try:
        from open_webui.retrieval.utils import get_sources_from_files
        from open_webui.models.files import Files
        from open_webui.retrieval.vector.connector import VECTOR_DB_CLIENT
        
        print("✅ Modules importés avec succès")
    except ImportError as e:
        print(f"❌ Erreur d'import: {e}")
        return
    
    # Étape 2: Chercher le fichier réel dans la base de données
    print(f"\n📁 === RECHERCHE DU FICHIER ===")
    
    try:
        # Rechercher tous les fichiers avec "test_pdf_210000bytes_003.pdf"
        files_model = Files()
        all_files = files_model.get_files()
        
        target_files = [f for f in all_files if "test_pdf_210000bytes_003.pdf" in f.filename]
        print(f"Fichiers trouvés avec ce nom: {len(target_files)}")
        
        if not target_files:
            print("❌ Aucun fichier trouvé dans la DB")
            return
        
        target_file = target_files[0]
        print(f"✅ Fichier trouvé: {target_file.filename}")
        print(f"   ID: {target_file.id}")
        print(f"   Hash: {target_file.hash}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la recherche: {e}")
        # Fallback: utiliser l'ID de collection trouvé précédemment
        target_file = type('obj', (object,), {
            'id': '3ed48874-c986-461b-8f3a-34d373a0fb3e',
            'filename': 'test_pdf_210000bytes_003.pdf',
            'hash': 'unknown'
        })()
        print(f"🔄 Fallback: utilisation de l'ID collection {target_file.id}")
    
    # Étape 3: Tracer la vraie fonction get_sources_from_files
    print(f"\n🔧 === TEST DE get_sources_from_files ===")
    
    try:
        # Simuler les paramètres d'une vraie requête RAG
        files = [target_file]
        query = "Analysez ce document et listez TOUS les marqueurs DEBUT_XXXXXXXX, MARK_XXXXXXXX, FIN_XXXXXXXX que vous détectez, dans l'ordre d'apparition exacte."
        
        print(f"Query: {query[:50]}...")
        print(f"File ID: {target_file.id}")
        
        # Appeler la vraie fonction utilisée par le système
        rag_results = get_sources_from_files(
            files=files,
            queries=[query],
            embedding_function=None,  # Utilise la config par défaut
            k=300,  # RAG_TOP_K
            reranking_function=None,
            k_reranker=3,
            r=0.0,
            hybrid_search=False,
            full_context=True  # RAG_FULL_CONTEXT
        )
        
        print(f"✅ get_sources_from_files a retourné {len(rag_results)} résultats")
        
        # Analyser les résultats
        total_content = ""
        for i, result in enumerate(rag_results):
            if hasattr(result, 'page_content'):
                content = result.page_content
            elif isinstance(result, dict) and 'content' in result:
                content = result['content']
            else:
                content = str(result)
            
            total_content += content + "\n\n"
            print(f"  Résultat {i+1}: {len(content)} caractères")
        
        # Extraire les marqueurs du contenu final
        final_markers = extract_markers_from_text(total_content)
        unique_markers = set(final_markers)
        
        print(f"\n📊 === RÉSULTATS FINAUX ===")
        print(f"Contenu total: {len(total_content)} caractères")
        print(f"Marqueurs totaux: {len(final_markers)}")
        print(f"Marqueurs uniques: {len(unique_markers)}")
        print(f"Doublons: {len(final_markers) - len(unique_markers)}")
        
        if unique_markers:
            print(f"\n🏷️ Marqueurs trouvés:")
            for marker in sorted(unique_markers):
                print(f"  - {marker}")
        else:
            print(f"\n❌ AUCUN MARQUEUR TROUVÉ!")
        
        # Sauvegarder le contenu pour inspection
        with open("contenu_rag_reel.txt", "w", encoding='utf-8') as f:
            f.write(total_content)
        print(f"\n💾 Contenu sauvegardé dans: contenu_rag_reel.txt")
        
        # Comparaison avec l'objectif
        expected_markers = 39
        recovery_rate = (len(unique_markers) / expected_markers) * 100
        
        print(f"\n📈 === PERFORMANCE RÉELLE ===")
        print(f"Attendu: {expected_markers} marqueurs")
        print(f"Obtenu: {len(unique_markers)} marqueurs")
        print(f"Taux de récupération: {recovery_rate:.1f}%")
        
        if recovery_rate >= 100:
            print("✅ SUCCÈS: 100% des marqueurs récupérés")
        else:
            print(f"❌ ÉCHEC: {expected_markers - len(unique_markers)} marqueurs manquants")
            print("🔍 Le problème est dans get_sources_from_files ou ses dépendances")
        
        return recovery_rate >= 100
        
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Point d'entrée"""
    success = trace_rag_pipeline()
    
    if not success:
        print(f"\n🔧 === PROCHAINES ÉTAPES ===")
        print("1. Vérifier la fonction get_sources_from_files")
        print("2. Tracer les appels internes step-by-step") 
        print("3. Identifier où les marqueurs se perdent")
        print("4. Corriger la fonction défaillante")

if __name__ == "__main__":
    main()