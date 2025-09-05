#!/usr/bin/env python3
"""
🔥 Test de l'impact de RAG_TOP_K sur la récupération des marqueurs
"""
import os
import sys
import re
from pathlib import Path

# Ajouter le chemin backend au PYTHONPATH
backend_path = Path(__file__).parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

# Configuration de l'environnement
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

def test_k_limitation():
    """Test l'impact de différentes valeurs de K"""
    print("🔍 === TEST LIMITATION PAR RAG_TOP_K ===\n")
    
    from open_webui.retrieval.vector.connector import VECTOR_DB_CLIENT
    from open_webui.retrieval.utils import reconstruct_chunks_ordered
    
    # Collection avec nos 39 marqueurs
    collection_name = "file-3ed48874-c986-461b-8f3a-34d373a0fb3e"
    print(f"🎯 Collection: {collection_name}")
    
    try:
        # Récupérer tout le contenu
        all_results = VECTOR_DB_CLIENT.get(collection_name)
        documents = all_results.documents[0]
        metadatas = all_results.metadatas[0]
        
        print(f"📊 Total chunks: {len(documents)}")
        
        # Marqueurs de référence
        all_markers = set()
        for doc in documents:
            all_markers.update(extract_markers_from_text(doc))
        print(f"📊 Marqueurs de référence: {len(all_markers)}")
        
        # Tester différentes valeurs de K
        k_values = [3, 10, 50, 100, 150, 200, 215]  # 215 = tous les chunks
        
        print(f"\n🔧 === TESTS AVEC DIFFÉRENTS K ===")
        
        for k in k_values:
            print(f"\n--- Test K={k} ---")
            
            # Simuler la limitation à K chunks (prendre les premiers)
            limited_docs = documents[:k]
            limited_metas = metadatas[:k]
            
            print(f"Chunks utilisés: {len(limited_docs)}/{len(documents)}")
            
            # Calculer marqueurs avant reconstruction
            raw_markers = set()
            for doc in limited_docs:
                raw_markers.update(extract_markers_from_text(doc))
            
            # Appliquer reconstruction
            reconstructed_content, _ = reconstruct_chunks_ordered(limited_docs, limited_metas)
            
            # Calculer marqueurs finaux
            final_markers_list = extract_markers_from_text(reconstructed_content)
            final_markers_set = set(final_markers_list)
            
            # Statistiques
            raw_recovery = (len(raw_markers) / len(all_markers)) * 100
            final_recovery = (len(final_markers_set) / len(all_markers)) * 100
            duplicates = len(final_markers_list) - len(final_markers_set)
            
            print(f"  Brut: {len(raw_markers)}/{len(all_markers)} marqueurs ({raw_recovery:.1f}%)")
            print(f"  Final: {len(final_markers_set)}/{len(all_markers)} marqueurs ({final_recovery:.1f}%)")
            print(f"  Doublons: {duplicates}")
            
            if final_recovery >= 100.0:
                print(f"  ✅ SUCCÈS avec K={k}")
                success_k = k
                break
            elif final_recovery >= 90.0:
                print(f"  ⚠️  Presque succès avec K={k}")
            else:
                print(f"  ❌ Insuffisant avec K={k}")
        
        # Test spécial: ordre d'apparition vs ordre chronologique
        print(f"\n🔍 === ANALYSE DE L'ORDRE DES CHUNKS ===")
        
        # Analyser l'ordre des chunks par métadonnées
        chunks_with_positions = []
        for i, (doc, meta) in enumerate(zip(documents, metadatas)):
            markers = extract_markers_from_text(doc)
            if markers and meta:
                page = meta.get('page', 0)
                start_index = meta.get('start_index', 0)
                chunks_with_positions.append({
                    'index': i,
                    'page': page,
                    'start_index': start_index, 
                    'markers': markers,
                    'first_marker': markers[0] if markers else None
                })
        
        print(f"Chunks avec marqueurs: {len(chunks_with_positions)}")
        
        # Afficher les premiers chunks par ordre d'apparition vs ordre chronologique
        print(f"\nPremiers chunks (ordre d'apparition dans la liste):")
        for i, chunk in enumerate(chunks_with_positions[:10]):
            print(f"  {i+1:2d}. Index={chunk['index']:3d}, Page={chunk['page']:2d}, Start={chunk['start_index']:5d}, Marker={chunk['first_marker']}")
        
        # Trier par ordre chronologique
        sorted_chunks = sorted(chunks_with_positions, key=lambda x: (x['page'], x['start_index']))
        print(f"\nPremiers chunks (ordre chronologique):")
        for i, chunk in enumerate(sorted_chunks[:10]):
            print(f"  {i+1:2d}. Index={chunk['index']:3d}, Page={chunk['page']:2d}, Start={chunk['start_index']:5d}, Marker={chunk['first_marker']}")
        
        # Identifier le problème probable
        original_order = [c['first_marker'] for c in chunks_with_positions[:10]]
        sorted_order = [c['first_marker'] for c in sorted_chunks[:10]]
        
        if original_order != sorted_order:
            print(f"\n🎯 === PROBLÈME IDENTIFIÉ ===")
            print("❌ L'ordre des chunks dans la base ne correspond PAS à l'ordre chronologique")
            print("💡 Quand on prend les premiers K chunks, on ne prend pas forcément les bons!")
            print("🔧 Solutions:")
            print("   1. Augmenter K pour prendre plus de chunks")
            print("   2. Améliorer la recherche vectorielle pour trouver les bons chunks")
            print("   3. Trier les résultats par ordre chronologique AVANT la limitation K")
        else:
            print(f"\n✅ L'ordre des chunks semble correct")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_k_limitation()