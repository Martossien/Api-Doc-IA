#!/usr/bin/env python3
"""
🔍 Debug: Identifier quelle collection est sélectionnée pour le fichier test
"""
import os
import sys
import re
from pathlib import Path

# Ajouter le chemin backend au PYTHONPATH
backend_path = Path(__file__).parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

os.environ['WEBUI_AUTH'] = 'False'

def debug_file_selection():
    """Debug de la sélection des fichiers et collections"""
    print("🔍 === DEBUG SÉLECTION DE FICHIER ===\n")
    
    from open_webui.retrieval.vector.connector import VECTOR_DB_CLIENT
    from open_webui.models.files import Files
    
    try:
        # 1. Lister tous les fichiers dans la DB
        print("📁 === FICHIERS EN BASE DE DONNÉES ===")
        files_table = Files()
        all_files = files_table.get_files()
        
        target_files = []
        for file in all_files:
            if "test_pdf" in file.filename or "210000" in file.filename:
                target_files.append(file)
                print(f"✅ {file.filename}")
                print(f"   ID: {file.id}")
                print(f"   Hash: {file.hash}")
                print(f"   Created: {file.created_at}")
                print()
        
        if not target_files:
            print("❌ Aucun fichier test trouvé en DB")
            return
        
        # 2. Vérifier les collections correspondantes
        print("📊 === COLLECTIONS CORRESPONDANTES ===")
        collections = VECTOR_DB_CLIENT.client.list_collections()
        
        for file in target_files:
            matching_collections = [c for c in collections if file.id in c]
            print(f"Fichier: {file.filename}")
            print(f"Collections correspondantes: {len(matching_collections)}")
            
            for collection_name in matching_collections:
                print(f"  📂 Collection: {collection_name}")
                
                # Analyser le contenu de la collection
                try:
                    result = VECTOR_DB_CLIENT.get(collection_name)
                    if result and result.documents:
                        documents = result.documents[0]
                        print(f"     Chunks: {len(documents)}")
                        
                        # Analyser les marqueurs
                        doc_markers = set()
                        doc_numbers = set()
                        
                        for doc in documents[:10]:  # Analyser les 10 premiers chunks
                            # Chercher les numéros de document
                            doc_nums = re.findall(r'DOC_(\d+)', doc)
                            doc_numbers.update(doc_nums)
                            
                            # Chercher les marqueurs
                            markers = re.findall(r'(DEBUT_DOC_\d+|MARK_[^\\s]+|FIN_DOC_\d+)', doc)
                            doc_markers.update(markers)
                        
                        if doc_numbers:
                            print(f"     Numéros de doc trouvés: {sorted(doc_numbers)}")
                        if doc_markers:
                            print(f"     Premiers marqueurs: {sorted(list(doc_markers))[:5]}")
                        
                        # Identifier le problème
                        has_doc_001 = any("DOC_001" in m for m in doc_markers)
                        has_doc_003 = any("DOC_003" in m for m in doc_markers)
                        
                        if has_doc_001 and not has_doc_003:
                            print(f"     ⚠️  PROBLÈME: Collection contient DOC_001 au lieu de DOC_003")
                        elif has_doc_003:
                            print(f"     ✅ Correct: Collection contient DOC_003")
                        else:
                            print(f"     ❓ Inconnu: Pas de marqueur DOC_ clair")
                            
                except Exception as e:
                    print(f"     ❌ Erreur d'accès: {e}")
                
                print()
        
        # 3. Recommandations
        print("🔧 === RECOMMANDATIONS ===")
        
        # Trouver la bonne collection DOC_003
        correct_collection = None
        for collection_name in collections:
            if "file-" in collection_name:
                try:
                    result = VECTOR_DB_CLIENT.get(collection_name)
                    if result and result.documents:
                        sample_doc = result.documents[0][0] if result.documents[0] else ""
                        if "DOC_003" in sample_doc and "MARK_" in sample_doc and "_OCTETS_" in sample_doc:
                            correct_collection = collection_name
                            break
                except:
                    continue
        
        if correct_collection:
            print(f"✅ Collection correcte trouvée: {correct_collection}")
            print("💡 Le problème est probablement dans la sélection de fichier lors de l'attachement")
        else:
            print("❌ Aucune collection DOC_003 correcte trouvée")
            print("💡 Le fichier test n'a peut-être pas été correctement indexé")
        
        print("\n🎯 === SOLUTIONS ===")
        print("1. Vérifier que vous attachez bien 'test_pdf_210000bytes_003.pdf'")
        print("2. Réindexer le fichier si nécessaire")
        print("3. Nettoyer les anciennes collections DOC_001")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_file_selection()