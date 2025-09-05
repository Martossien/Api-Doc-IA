#!/usr/bin/env python3
"""
🔍 Analyse : Pourquoi le système permet la pollution des collections ?
"""
import os
import sys
from pathlib import Path

# Chemins vers les deux versions
backend_path = Path(__file__).parent / "backend"
original_path = Path(__file__).parent / "openwebui-original" / "backend"

print("🔍 === ANALYSE DE LA POLLUTION DES COLLECTIONS ===\n")

def compare_collection_logic():
    """Comparer la logique de gestion des collections"""
    
    print("📁 === COMPARAISON DES FICHIERS DE GESTION ===")
    
    # 1. Comparer les fonctions de création de collections
    current_utils = backend_path / "open_webui" / "retrieval" / "utils.py"
    original_utils = original_path / "open_webui" / "retrieval" / "utils.py"
    
    print(f"Version actuelle: {current_utils}")
    print(f"Version originale: {original_utils}")
    
    # 2. Vérifier les différences dans la logique de nommage des collections
    print(f"\n🔍 === LOGIQUE DE NOMMAGE DES COLLECTIONS ===")
    
    # Extraire la logique de nommage de la version actuelle
    try:
        with open(current_utils, 'r', encoding='utf-8') as f:
            current_content = f.read()
        
        # Chercher les patterns de nommage de collections
        import re
        collection_patterns_current = re.findall(r'collection.*name.*=.*["\']([^"\']+)["\']', current_content, re.IGNORECASE)
        file_id_patterns_current = re.findall(r'file.*id.*collection', current_content, re.IGNORECASE)
        
        print(f"Version actuelle - Patterns de collections trouvés: {len(collection_patterns_current)}")
        
        # Chercher comment l'ID de fichier est utilisé
        file_id_usage = re.findall(r'f["\']file-\{[^}]+\}["\']', current_content)
        print(f"Usage file-{{id}}: {len(file_id_usage)} occurrences")
        
    except FileNotFoundError:
        print("❌ Fichier version actuelle non trouvé")
    
    # Extraire la logique de la version originale
    try:
        with open(original_utils, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        collection_patterns_original = re.findall(r'collection.*name.*=.*["\']([^"\']+)["\']', original_content, re.IGNORECASE)
        file_id_patterns_original = re.findall(r'file.*id.*collection', original_content, re.IGNORECASE)
        
        print(f"Version originale - Patterns de collections trouvés: {len(collection_patterns_original)}")
        
        file_id_usage_orig = re.findall(r'f["\']file-\{[^}]+\}["\']', original_content)
        print(f"Usage file-{{id}}: {len(file_id_usage_orig)} occurrences")
        
    except FileNotFoundError:
        print("❌ Fichier version originale non trouvé")
    
    print(f"\n🎯 === HYPOTHÈSES SUR LA POLLUTION ===")
    print("1. **Génération d'ID non-déterministe** :")
    print("   - Chaque upload génère un nouvel ID unique")
    print("   - Même fichier = IDs différents = collections multiples")
    print()
    print("2. **Pas de déduplication par contenu** :")
    print("   - Le système ne vérifie pas si le contenu existe déjà")
    print("   - Hash du fichier non utilisé pour la déduplication")
    print()
    print("3. **Pas de nettoyage automatique** :")
    print("   - Les anciennes collections ne sont pas supprimées")
    print("   - Accumulation progressive de doublons")
    print()
    print("4. **Sélection aléatoire/chronologique** :")
    print("   - Le système pourrait prendre la première collection trouvée")
    print("   - Ou la plus récente, ou selon l'ordre alphabétique")

def analyze_file_upload_process():
    """Analyser le processus d'upload de fichiers"""
    
    print(f"\n📤 === PROCESSUS D'UPLOAD DE FICHIERS ===")
    
    # Chercher les routes d'upload
    routes_path = backend_path / "open_webui" / "routers"
    
    if routes_path.exists():
        print(f"Dossier routes trouvé: {routes_path}")
        
        # Lister les fichiers de routes
        route_files = list(routes_path.glob("*.py"))
        print(f"Fichiers de routes: {[f.name for f in route_files]}")
        
        # Chercher spécifiquement les routes de fichiers
        files_route = routes_path / "files.py"
        if files_route.exists():
            print(f"\n🔍 Analyse de files.py...")
            
            try:
                with open(files_route, 'r', encoding='utf-8') as f:
                    files_content = f.read()
                
                # Chercher les fonctions d'upload
                upload_functions = re.findall(r'def\s+([^(]*upload[^(]*)\(', files_content, re.IGNORECASE)
                print(f"Fonctions d'upload trouvées: {upload_functions}")
                
                # Chercher la génération d'ID
                id_generation = re.findall(r'(uuid\.uuid4\(\)|str\(uuid\.uuid4\(\)\))', files_content)
                print(f"Génération d'UUID trouvée: {len(id_generation)} fois")
                
                # Chercher les vérifications de doublons
                duplicate_checks = re.findall(r'(hash|duplicate|exists|check)', files_content, re.IGNORECASE)
                print(f"Vérifications potentielles de doublons: {len(duplicate_checks)} occurrences")
                
                if len(duplicate_checks) == 0:
                    print("⚠️  PROBLÈME: Aucune vérification de doublon détectée !")
                
            except Exception as e:
                print(f"❌ Erreur lecture files.py: {e}")
        else:
            print("❌ files.py non trouvé")
    else:
        print("❌ Dossier routes non trouvé")

def analyze_collection_selection():
    """Analyser comment les collections sont sélectionnées"""
    
    print(f"\n🎯 === SÉLECTION DES COLLECTIONS ===")
    
    # Analyser la fonction get_sources_from_files
    try:
        with open(backend_path / "open_webui" / "retrieval" / "utils.py", 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extraire la logique de sélection
        selection_logic = re.findall(r'collection_names.*=.*\[(.*?)\]', content, re.DOTALL)
        print(f"Logiques de sélection trouvées: {len(selection_logic)}")
        
        # Chercher l'ordre de traitement
        for_loops = re.findall(r'for\s+\w+\s+in\s+(files|collection_names)', content)
        print(f"Boucles de traitement: {for_loops}")
        
        # Vérifier s'il y a une logique de priorisation
        priority_logic = re.findall(r'(sort|order|priority|first|last)', content, re.IGNORECASE)
        print(f"Logique de priorisation: {len(priority_logic)} occurrences")
        
        if len(priority_logic) == 0:
            print("⚠️  PROBLÈME: Aucune priorisation dans la sélection des collections !")
            print("💡 Le système prend probablement la première collection trouvée")
        
    except Exception as e:
        print(f"❌ Erreur analyse sélection: {e}")

def recommendations():
    """Recommandations pour corriger le problème"""
    
    print(f"\n🔧 === RECOMMANDATIONS POUR CORRIGER ===")
    
    print("1. **Déduplication par hash de contenu** :")
    print("   - Calculer un hash du contenu du fichier")
    print("   - Vérifier si une collection existe déjà pour ce hash")
    print("   - Réutiliser la collection existante au lieu d'en créer une nouvelle")
    print()
    
    print("2. **Nettoyage automatique** :")
    print("   - Supprimer les anciennes collections lors d'un nouvel upload")
    print("   - Ou marquer les collections avec des timestamps")
    print()
    
    print("3. **Sélection déterministe** :")
    print("   - Prioriser les collections les plus récentes")
    print("   - Ou utiliser un critère de sélection cohérent")
    print()
    
    print("4. **Validation de cohérence** :")
    print("   - Vérifier que la collection sélectionnée correspond au fichier attendu")
    print("   - Alerter en cas de collections multiples pour le même fichier")
    
    print(f"\n⚠️  === IMPACT DE LA POLLUTION ===")
    print("❌ Résultats RAG incohérents et imprévisibles") 
    print("❌ Mélange de données de différents documents")
    print("❌ Impossibilité de reproduire les résultats")
    print("❌ Dégradation progressive des performances")
    print("❌ Stockage gonflé avec des doublons")

if __name__ == "__main__":
    compare_collection_logic()
    analyze_file_upload_process() 
    analyze_collection_selection()
    recommendations()
    
    print(f"\n" + "="*80)
    print("🎯 CONCLUSION: La pollution des collections est un BUG MAJEUR")
    print("qui affecte la fiabilité du système RAG. Une refonte de la")
    print("gestion des collections est nécessaire pour éviter ce problème.")
    print("="*80)