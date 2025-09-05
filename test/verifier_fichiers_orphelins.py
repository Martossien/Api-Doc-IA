#!/usr/bin/env python3
"""
🔍 Vérifier les fichiers orphelins dans la base de données
"""
import os
import sys
import sqlite3
from pathlib import Path

backend_path = Path(__file__).parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

os.environ['WEBUI_AUTH'] = 'False'

def check_database_files():
    """Vérifier les fichiers dans la base de données SQLite"""
    print("🗃️ === VÉRIFICATION BASE DE DONNÉES ===\n")
    
    # Trouver le fichier de base de données
    db_path = None
    possible_paths = [
        "backend/data/webui.db",
        "data/webui.db", 
        "webui.db",
        "/app/backend/data/webui.db"
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            db_path = path
            break
    
    if not db_path:
        print("❌ Base de données non trouvée")
        return
    
    print(f"📊 Base de données: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Lister les tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"📋 Tables: {[t[0] for t in tables]}")
        
        # Vérifier la table des fichiers
        if any('file' in table[0] for table in tables):
            # Trouver la bonne table de fichiers
            file_tables = [t[0] for t in tables if 'file' in t[0].lower()]
            print(f"📁 Tables de fichiers: {file_tables}")
            
            for table_name in file_tables:
                try:
                    cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
                    rows = cursor.fetchall()
                    
                    # Obtenir les noms de colonnes
                    cursor.execute(f"PRAGMA table_info({table_name})")
                    columns = cursor.fetchall()
                    column_names = [col[1] for col in columns]
                    
                    print(f"\n📊 Table {table_name}:")
                    print(f"   Colonnes: {column_names}")
                    print(f"   Échantillon: {len(rows)} lignes")
                    
                    # Chercher des fichiers avec "test" dans le nom
                    if 'filename' in column_names:
                        cursor.execute(f"SELECT * FROM {table_name} WHERE filename LIKE '%test%' OR filename LIKE '%003%' OR filename LIKE '%001%'")
                        test_files = cursor.fetchall()
                        
                        if test_files:
                            print(f"   🎯 Fichiers test trouvés: {len(test_files)}")
                            for i, row in enumerate(test_files):
                                row_dict = dict(zip(column_names, row))
                                print(f"      {i+1}. ID: {row_dict.get('id', 'N/A')}")
                                print(f"         Filename: {row_dict.get('filename', 'N/A')}")
                                print(f"         Hash: {row_dict.get('hash', 'N/A')}")
                                if 'created_at' in row_dict:
                                    print(f"         Created: {row_dict.get('created_at', 'N/A')}")
                        else:
                            print(f"   ❌ Aucun fichier test trouvé dans {table_name}")
                    
                except Exception as e:
                    print(f"   ❌ Erreur table {table_name}: {e}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erreur base de données: {e}")

def check_file_attachment_logic():
    """Vérifier comment l'interface web sélectionne les fichiers"""
    print(f"\n🔗 === LOGIQUE D'ATTACHEMENT DE FICHIERS ===")
    
    print("📝 Hypothèses sur la sélection de fichier:")
    print("1. L'interface web utilise le FILENAME pour trouver le fichier")
    print("2. Si plusieurs fichiers ont le même nom → sélection aléatoire/chronologique")
    print("3. La sélection pourrait utiliser l'ID le plus récent ou le plus ancien")
    print("4. Il pourrait y avoir un cache côté frontend")
    
    print(f"\n💡 Points de contrôle à vérifier:")
    print("- Quel fichier 'test_pdf_210000bytes_003.pdf' est sélectionné ?")
    print("- Y a-t-il plusieurs versions de ce fichier en DB ?")
    print("- L'interface utilise-t-elle le bon ID de fichier ?")
    print("- La correspondance fichier → collection est-elle correcte ?")

def check_upload_directory():
    """Vérifier les fichiers uploadés sur le disque"""
    print(f"\n💾 === FICHIERS SUR DISQUE ===")
    
    upload_paths = [
        "backend/data/uploads",
        "data/uploads",
        "uploads",
        "/app/backend/data/uploads",
        "/app/uploads"
    ]
    
    for upload_path in upload_paths:
        if os.path.exists(upload_path):
            print(f"📁 Dossier uploads trouvé: {upload_path}")
            
            try:
                files = list(Path(upload_path).rglob("*"))
                pdf_files = [f for f in files if str(f).endswith('.pdf')]
                test_files = [f for f in files if 'test' in str(f).lower() or '003' in str(f) or '001' in str(f)]
                
                print(f"   📊 Fichiers total: {len(files)}")
                print(f"   📄 Fichiers PDF: {len(pdf_files)}")
                print(f"   🎯 Fichiers test: {len(test_files)}")
                
                if test_files:
                    print(f"   📋 Fichiers test détaillés:")
                    for f in test_files[:10]:  # Maximum 10
                        stat = f.stat()
                        print(f"      - {f.name} ({stat.st_size} bytes, {stat.st_mtime})")
                
                return len(test_files)
                
            except Exception as e:
                print(f"   ❌ Erreur lecture: {e}")
    
    print("❌ Aucun dossier uploads trouvé")
    return 0

if __name__ == "__main__":
    print("="*80)
    print("🔍 VÉRIFICATION FICHIERS ORPHELINS ET BASE DE DONNÉES")
    print("="*80)
    
    check_database_files()
    check_file_attachment_logic()
    upload_count = check_upload_directory()
    
    print(f"\n" + "="*80)
    print("🎯 CONCLUSION:")
    print("Si des fichiers orphelins existent, ils pourraient causer")
    print("la sélection de mauvaises données malgré le nettoyage des collections.")
    print("="*80)