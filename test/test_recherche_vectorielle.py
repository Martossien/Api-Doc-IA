#!/usr/bin/env python3
"""
🔥 Test direct de recherche vectorielle pour identifier le vrai problème
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

def simulate_vector_search():
    """Simule une recherche vectorielle directe"""
    print("🔍 === TEST RECHERCHE VECTORIELLE DIRECTE ===\n")
    
    from open_webui.retrieval.vector.connector import VECTOR_DB_CLIENT
    
    # Collection avec nos 39 marqueurs
    collection_name = "file-3ed48874-c986-461b-8f3a-34d373a0fb3e"
    print(f"🎯 Collection: {collection_name}")
    
    try:
        # Étape 1: Récupérer tout le contenu de la collection
        print("\n📊 === ÉTAPE 1: CONTENU COMPLET ===")
        all_results = VECTOR_DB_CLIENT.get(collection_name)
        
        documents = all_results.documents[0]
        metadatas = all_results.metadatas[0] 
        ids = all_results.ids[0]
        
        print(f"Chunks total: {len(documents)}")
        
        all_markers = set()
        for doc in documents:
            all_markers.update(extract_markers_from_text(doc))
        print(f"Marqueurs total en base: {len(all_markers)}")
        
        # Étape 2: Simuler une recherche vectorielle avec embedding
        print("\n🔍 === ÉTAPE 2: RECHERCHE VECTORIELLE ===")
        
        # Importer les fonctions d'embedding
        from open_webui.retrieval.utils import get_embedding_function
        
        query = "Analysez ce document et listez TOUS les marqueurs DEBUT_XXXXXXXX, MARK_XXXXXXXX, FIN_XXXXXXXX"
        print(f"Query: {query[:50]}...")
        
        # Obtenir la fonction d'embedding
        embedding_function = get_embedding_function()
        print(f"✅ Fonction embedding obtenue")
        
        # Créer l'embedding de la requête
        query_embedding = embedding_function([query])
        print(f"✅ Embedding query créé: {len(query_embedding[0])} dimensions")
        
        # Faire la recherche vectorielle
        k_limit = 300  # RAG_TOP_K
        search_results = VECTOR_DB_CLIENT.search(
            collection_name=collection_name,
            vectors=query_embedding,
            limit=k_limit
        )
        
        if not search_results:
            print("❌ Aucun résultat de recherche")
            return False
            
        print(f"✅ Recherche retournée: {len(search_results.documents[0])} résultats")
        
        # Analyser les résultats de recherche
        search_docs = search_results.documents[0]
        search_distances = search_results.distances[0] if search_results.distances else []
        search_metadatas = search_results.metadatas[0] if search_results.metadatas else []
        
        print(f"Documents: {len(search_docs)}")
        print(f"Distances: {len(search_distances)}")
        
        # Afficher les scores de similarité
        if search_distances:
            print(f"Score min: {min(search_distances):.4f}")
            print(f"Score max: {max(search_distances):.4f}")
            print(f"Score moyen: {sum(search_distances)/len(search_distances):.4f}")
        
        # Extraire les marqueurs des résultats de recherche
        search_markers = set()
        for doc in search_docs:
            search_markers.update(extract_markers_from_text(doc))
            
        print(f"Marqueurs trouvés par recherche: {len(search_markers)}")
        
        # Étape 3: Appliquer reconstruct_chunks_ordered sur les résultats de recherche
        print("\n🔧 === ÉTAPE 3: RECONSTRUCTION ===")
        
        from open_webui.retrieval.utils import reconstruct_chunks_ordered
        
        reconstructed_content, sorted_pairs = reconstruct_chunks_ordered(search_docs, search_metadatas)
        
        final_markers_list = extract_markers_from_text(reconstructed_content)
        final_markers_set = set(final_markers_list)
        
        print(f"Contenu reconstruit: {len(reconstructed_content)} caractères")
        print(f"Marqueurs finaux: {len(final_markers_set)}")
        print(f"Doublons: {len(final_markers_list) - len(final_markers_set)}")
        
        # Comparaison finale
        print(f"\n📊 === COMPARAISON FINALE ===")
        print(f"Base complète: {len(all_markers)} marqueurs")
        print(f"Recherche vectorielle: {len(search_markers)} marqueurs") 
        print(f"Reconstruction finale: {len(final_markers_set)} marqueurs")
        
        # Identifier où se perd l'information
        lost_in_search = all_markers - search_markers
        lost_in_reconstruction = search_markers - final_markers_set
        
        print(f"\n🔍 === ANALYSE DES PERTES ===")
        print(f"Perdus lors de la recherche: {len(lost_in_search)}")
        print(f"Perdus lors de la reconstruction: {len(lost_in_reconstruction)}")
        
        if lost_in_search:
            print(f"\n❌ Marqueurs perdus lors de la recherche vectorielle:")
            for marker in sorted(lost_in_search)[:10]:  # Afficher les 10 premiers
                print(f"  - {marker}")
        
        if lost_in_reconstruction:
            print(f"\n❌ Marqueurs perdus lors de la reconstruction:")
            for marker in sorted(lost_in_reconstruction):
                print(f"  - {marker}")
        
        # Diagnostic du problème principal
        if len(lost_in_search) > len(lost_in_reconstruction):
            print(f"\n🎯 === PROBLÈME IDENTIFIÉ ===")
            print("❌ Le problème principal est dans la RECHERCHE VECTORIELLE")
            print("💡 Solutions possibles:")
            print("   - Augmenter k (RAG_TOP_K)")
            print("   - Améliorer la requête d'embedding") 
            print("   - Vérifier les seuils de similarité")
        elif len(lost_in_reconstruction) > 0:
            print(f"\n🎯 === PROBLÈME IDENTIFIÉ ===") 
            print("❌ Le problème principal est dans la RECONSTRUCTION")
        else:
            print(f"\n✅ === PAS DE PERTE DÉTECTÉE ===")
            print("Le problème pourrait être ailleurs dans le pipeline")
        
        # Sauvegarder pour analyse
        with open("debug_recherche_vectorielle.txt", "w", encoding='utf-8') as f:
            f.write(f"=== CONTENU RECONSTRUIT ===\n")
            f.write(reconstructed_content)
            f.write(f"\n\n=== MARQUEURS FINAUX ===\n")
            for marker in sorted(final_markers_set):
                f.write(f"{marker}\n")
        
        print(f"\n💾 Debug sauvegardé: debug_recherche_vectorielle.txt")
        
        return len(final_markers_set) >= 39
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = simulate_vector_search()
    print(f"\n🎯 Résultat: {'SUCCÈS' if success else 'ÉCHEC'}")