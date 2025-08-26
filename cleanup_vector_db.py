#!/usr/bin/env python3
"""
Script de Nettoyage Intelligent ChromaDB + Uploads
API-Doc-IA - Gestion de Rétention avec Paramètres

Usage:
    python cleanup_vector_db.py --retention-hours 1    # Garde seulement 1 heure
    python cleanup_vector_db.py --retention-days 7     # Garde 7 jours
    python cleanup_vector_db.py --dry-run              # Simulation sans suppression
"""

import os
import sys
import sqlite3
import shutil
import argparse
import logging
from datetime import datetime, timedelta
from pathlib import Path
import json

# Configuration des chemins
BASE_DIR = Path("/home/admin_ia/api/Api-Doc-IA/backend/open_webui/data")
UPLOADS_DIRS = [
    BASE_DIR / "uploads",
    Path("/home/admin_ia/api/Api-Doc-IA/backend/data/uploads")
]
VECTOR_DB_DIR = BASE_DIR / "vector_db"
CHROMA_DB = VECTOR_DB_DIR / "chroma.sqlite3"
WEBUI_DB = BASE_DIR / "webui.db"

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(BASE_DIR / "cleanup.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

class ChromaDBCleaner:
    def __init__(self, dry_run=False):
        self.dry_run = dry_run
        self.stats = {
            'collections_found': 0,
            'collections_deleted': 0,
            'uploads_found': 0,
            'uploads_deleted': 0,
            'orphan_uploads_found': 0,
            'orphan_uploads_deleted': 0,
            'db_entries_deleted': 0,
            'disk_space_freed': 0,
            'errors': []
        }
        
    def get_database_connection(self):
        """Connexion sécurisée à ChromaDB"""
        try:
            conn = sqlite3.connect(CHROMA_DB, timeout=10.0)
            conn.row_factory = sqlite3.Row
            return conn
        except Exception as e:
            log.error(f"Erreur connexion ChromaDB: {e}")
            raise

    def get_collections_to_cleanup(self, cutoff_time):
        """Identifie les collections à supprimer basé sur l'âge des uploads"""
        collections_to_delete = []
        
        try:
            # Analyser tous les répertoires d'uploads
            for uploads_dir in UPLOADS_DIRS:
                if not uploads_dir.exists():
                    continue
                    
                for upload_file in uploads_dir.iterdir():
                    if not upload_file.is_file():
                        continue
                        
                    # Extraire l'UUID du nom de fichier (format: uuid_filename.ext)
                    filename = upload_file.name
                    if '_' not in filename:
                        continue
                        
                    uuid = filename.split('_')[0]
                    if len(uuid) != 36:  # UUID standard length
                        continue
                    
                    # Vérifier l'âge du fichier upload
                    file_mtime = datetime.fromtimestamp(upload_file.stat().st_mtime)
                    if file_mtime < cutoff_time:
                        collection_name = f"file-{uuid}"
                        
                        # Vérifier si la collection existe dans ChromaDB
                        with self.get_database_connection() as conn:
                            cursor = conn.cursor()
                            cursor.execute(
                                "SELECT id, name FROM collections WHERE name = ?", 
                                (collection_name,)
                            )
                            collection = cursor.fetchone()
                            
                            if collection:
                                # Chercher tous les fichiers associés à cet UUID dans tous les répertoires
                                associated_files = []
                                for udir in UPLOADS_DIRS:
                                    if udir.exists():
                                        associated_files.extend([
                                            f for f in udir.iterdir() 
                                            if f.is_file() and f.name.startswith(uuid + '_')
                                        ])
                                
                                total_size = sum(f.stat().st_size for f in associated_files)
                                
                                collections_to_delete.append({
                                    'collection_id': collection['id'],
                                    'collection_name': collection['name'],
                                    'uuid': uuid,
                                    'upload_files': associated_files,
                                    'age': datetime.now() - file_mtime,
                                    'size': total_size
                                })
                            
        except Exception as e:
            log.error(f"Erreur lors de l'identification des collections: {e}")
            self.stats['errors'].append(str(e))
            
        return collections_to_delete

    def _get_dir_size(self, path):
        """Calcule la taille d'un dossier"""
        total_size = 0
        try:
            for dirpath, dirnames, filenames in os.walk(path):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    if os.path.exists(filepath):
                        total_size += os.path.getsize(filepath)
        except Exception as e:
            log.warning(f"Erreur calcul taille {path}: {e}")
        return total_size

    def delete_collection_from_chromadb(self, collection_id, collection_name):
        """Supprime une collection de ChromaDB"""
        if self.dry_run:
            log.info(f"[DRY-RUN] Suppression collection ChromaDB: {collection_name}")
            return True
            
        try:
            with self.get_database_connection() as conn:
                cursor = conn.cursor()
                
                # Supprimer les embeddings associés
                cursor.execute("""
                    DELETE FROM embeddings 
                    WHERE segment_id IN (
                        SELECT id FROM segments WHERE collection = ?
                    )
                """, (collection_id,))
                
                # Supprimer les métadonnées d'embeddings
                cursor.execute("""
                    DELETE FROM embedding_metadata 
                    WHERE id IN (
                        SELECT e.id FROM embeddings e
                        JOIN segments s ON e.segment_id = s.id
                        WHERE s.collection = ?
                    )
                """, (collection_id,))
                
                # Supprimer les segments
                cursor.execute("DELETE FROM segments WHERE collection = ?", (collection_id,))
                
                # Supprimer les métadonnées de collection
                cursor.execute("DELETE FROM collection_metadata WHERE collection_id = ?", (collection_id,))
                
                # Supprimer la collection
                cursor.execute("DELETE FROM collections WHERE id = ?", (collection_id,))
                
                conn.commit()
                log.info(f"✅ Collection ChromaDB supprimée: {collection_name}")
                return True
                
        except Exception as e:
            log.error(f"❌ Erreur suppression collection {collection_name}: {e}")
            self.stats['errors'].append(f"ChromaDB {collection_name}: {e}")
            return False

    def delete_upload_files(self, upload_files):
        """Supprime les fichiers upload associés"""
        if self.dry_run:
            log.info(f"[DRY-RUN] Suppression {len(upload_files)} fichiers upload")
            return True
            
        success = True
        for upload_file in upload_files:
            try:
                upload_file.unlink()
                log.debug(f"✅ Fichier supprimé: {upload_file.name}")
            except Exception as e:
                log.error(f"❌ Erreur suppression {upload_file}: {e}")
                self.stats['errors'].append(f"Upload {upload_file}: {e}")
                success = False
                
        if success:
            log.info(f"✅ {len(upload_files)} fichiers upload supprimés")
        return success

    def delete_vector_directory(self, uuid):
        """Supprime le dossier vector correspondant"""
        vector_path = VECTOR_DB_DIR / uuid
        if vector_path.exists():
            if self.dry_run:
                log.info(f"[DRY-RUN] Suppression vector: {vector_path}")
                return True
                
            try:
                shutil.rmtree(vector_path)
                log.info(f"✅ Vector supprimé: {vector_path}")
                return True
            except Exception as e:
                log.error(f"❌ Erreur suppression vector {vector_path}: {e}")
                self.stats['errors'].append(f"Vector {vector_path}: {e}")
                return False
        return True

    def cleanup(self, retention_hours=1):
        """Lance le nettoyage principal"""
        cutoff_time = datetime.now() - timedelta(hours=retention_hours)
        
        log.info(f"🚀 Début du nettoyage - Rétention: {retention_hours}h")
        log.info(f"📅 Suppression des données avant: {cutoff_time}")
        log.info(f"🔍 Mode: {'SIMULATION' if self.dry_run else 'RÉEL'}")
        
        # Identifier les collections à supprimer
        collections_to_delete = self.get_collections_to_cleanup(cutoff_time)
        self.stats['collections_found'] = len(collections_to_delete)
        
        if not collections_to_delete:
            log.info("✅ Aucune collection à supprimer")
        else:
            log.info(f"📋 {len(collections_to_delete)} collections à supprimer")
        
        # Traiter chaque collection
        for item in collections_to_delete:
            log.info(f"🔄 Traitement: {item['collection_name']} (âge: {item['age']})")
            
            success = True
            
            # Supprimer de ChromaDB
            if not self.delete_collection_from_chromadb(item['collection_id'], item['collection_name']):
                success = False
            
            # Supprimer les fichiers upload
            if not self.delete_upload_files(item['upload_files']):
                success = False
                
            # Supprimer le dossier vector
            if not self.delete_vector_directory(item['uuid']):
                success = False
            
            if success:
                self.stats['collections_deleted'] += 1
                self.stats['disk_space_freed'] += item['size']
                log.info(f"✅ Suppression complète: {item['collection_name']}")
            else:
                log.warning(f"⚠️ Suppression partielle: {item['collection_name']}")
        
        # Nettoyer les fichiers upload orphelins
        log.info("🗂️ Nettoyage des fichiers upload orphelins...")
        self.cleanup_orphan_uploads(cutoff_time)
        
        # Nettoyer les entrées de base de données
        log.info("🗄️ Nettoyage des entrées de base de données...")
        self.cleanup_database_entries(cutoff_time)
        
        # Optimiser les bases après nettoyage
        if not self.dry_run and (self.stats['collections_deleted'] > 0 or self.stats['orphan_uploads_deleted'] > 0 or self.stats['db_entries_deleted'] > 0):
            self.optimize_database()
            
        return self.stats

    def get_webui_database_connection(self):
        """Connexion sécurisée à WebUI DB"""
        try:
            conn = sqlite3.connect(WEBUI_DB, timeout=10.0)
            conn.row_factory = sqlite3.Row
            return conn
        except Exception as e:
            log.error(f"Erreur connexion WebUI DB: {e}")
            raise

    def cleanup_orphan_uploads(self, cutoff_time):
        """Nettoie tous les fichiers upload anciens sans collection associée"""
        orphan_files = []
        
        try:
            # Identifier tous les fichiers anciens dans tous les répertoires d'uploads
            for uploads_dir in UPLOADS_DIRS:
                if not uploads_dir.exists():
                    continue
                    
                for upload_file in uploads_dir.iterdir():
                    if not upload_file.is_file():
                        continue
                        
                    file_mtime = datetime.fromtimestamp(upload_file.stat().st_mtime)
                    if file_mtime < cutoff_time:
                        orphan_files.append({
                            'path': upload_file,
                            'size': upload_file.stat().st_size,
                            'age': datetime.now() - file_mtime
                        })
                    
            self.stats['orphan_uploads_found'] = len(orphan_files)
            
            if not orphan_files:
                log.info("✅ Aucun fichier upload orphelin à supprimer")
                return True
                
            log.info(f"📋 {len(orphan_files)} fichiers upload orphelins à supprimer")
            
            # Supprimer les fichiers orphelins
            for file_info in orphan_files:
                if self.dry_run:
                    log.info(f"[DRY-RUN] Suppression upload orphelin: {file_info['path'].name}")
                else:
                    try:
                        file_info['path'].unlink()
                        self.stats['orphan_uploads_deleted'] += 1
                        self.stats['disk_space_freed'] += file_info['size']
                        log.debug(f"✅ Fichier orphelin supprimé: {file_info['path'].name}")
                    except Exception as e:
                        log.error(f"❌ Erreur suppression {file_info['path']}: {e}")
                        self.stats['errors'].append(f"Orphan {file_info['path']}: {e}")
                        
            if not self.dry_run and self.stats['orphan_uploads_deleted'] > 0:
                log.info(f"✅ {self.stats['orphan_uploads_deleted']} fichiers orphelins supprimés")
                
        except Exception as e:
            log.error(f"Erreur nettoyage fichiers orphelins: {e}")
            self.stats['errors'].append(str(e))
            return False
            
        return True

    def cleanup_database_entries(self, cutoff_time):
        """Nettoie les entrées anciennes dans webui.db"""
        try:
            cutoff_timestamp = int(cutoff_time.timestamp())
            
            with self.get_webui_database_connection() as conn:
                cursor = conn.cursor()
                
                # Compter les entrées à supprimer
                cursor.execute("SELECT COUNT(*) FROM file WHERE created_at < ?", (cutoff_timestamp,))
                count = cursor.fetchone()[0]
                
                if count == 0:
                    log.info("✅ Aucune entrée de base de données à supprimer")
                    return True
                
                log.info(f"📋 {count} entrées de base de données à supprimer")
                
                if not self.dry_run:
                    # Supprimer les entrées de fichiers anciens
                    cursor.execute("DELETE FROM file WHERE created_at < ?", (cutoff_timestamp,))
                    
                    # Supprimer les documents associés
                    cursor.execute("DELETE FROM document WHERE timestamp < ?", (cutoff_timestamp,))
                    
                    conn.commit()
                    self.stats['db_entries_deleted'] = count
                    log.info(f"✅ {count} entrées de base supprimées")
                else:
                    log.info(f"[DRY-RUN] Suppression {count} entrées de base")
                    
        except Exception as e:
            log.error(f"Erreur nettoyage base de données: {e}")
            self.stats['errors'].append(f"Database cleanup: {e}")
            return False
            
        return True

    def optimize_database(self):
        """Optimise ChromaDB et WebUI DB après nettoyage"""
        try:
            log.info("🔧 Optimisation des bases de données...")
            
            # Optimiser ChromaDB
            with self.get_database_connection() as conn:
                conn.execute("VACUUM")
                conn.execute("ANALYZE")
                
            # Optimiser WebUI DB
            with self.get_webui_database_connection() as conn:
                conn.execute("VACUUM")
                conn.execute("ANALYZE")
                
            log.info("✅ Optimisation terminée")
        except Exception as e:
            log.warning(f"⚠️ Erreur optimisation: {e}")

    def print_stats(self):
        """Affiche les statistiques finales"""
        print("\n" + "="*60)
        print("📊 STATISTIQUES DE NETTOYAGE COMPLET")
        print("="*60)
        print(f"Collections trouvées:        {self.stats['collections_found']}")
        print(f"Collections supprimées:      {self.stats['collections_deleted']}")
        print(f"Fichiers orphelins trouvés:  {self.stats['orphan_uploads_found']}")
        print(f"Fichiers orphelins supprimés: {self.stats['orphan_uploads_deleted']}")
        print(f"Entrées DB supprimées:       {self.stats['db_entries_deleted']}")
        print(f"Espace total libéré:         {self.stats['disk_space_freed'] / (1024*1024):.1f} MB")
        print(f"Erreurs:                    {len(self.stats['errors'])}")
        
        if self.stats['errors']:
            print("\n❌ ERREURS:")
            for error in self.stats['errors'][:5]:  # Afficher max 5 erreurs
                print(f"  - {error}")
        
        print("="*60)


def main():
    parser = argparse.ArgumentParser(description="Nettoyage intelligent ChromaDB + Uploads")
    parser.add_argument("--retention-hours", type=float, default=1, 
                       help="Rétention en heures (défaut: 1)")
    parser.add_argument("--retention-days", type=int, 
                       help="Rétention en jours (prioritaire sur --retention-hours)")
    parser.add_argument("--dry-run", action="store_true",
                       help="Mode simulation (aucune suppression réelle)")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Mode verbose")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Calculer la rétention en heures
    retention_hours = args.retention_hours
    if args.retention_days:
        retention_hours = args.retention_days * 24
    
    # Vérifications préliminaires
    if not CHROMA_DB.exists():
        log.error(f"❌ ChromaDB introuvable: {CHROMA_DB}")
        sys.exit(1)
        
    uploads_found = False
    for uploads_dir in UPLOADS_DIRS:
        if uploads_dir.exists():
            uploads_found = True
            break
    
    if not uploads_found:
        log.error(f"❌ Aucun dossier uploads trouvé: {UPLOADS_DIRS}")
        sys.exit(1)
    
    # Lancer le nettoyage
    cleaner = ChromaDBCleaner(dry_run=args.dry_run)
    
    try:
        stats = cleaner.cleanup(retention_hours=retention_hours)
        cleaner.print_stats()
        
        # Code de sortie basé sur le succès
        exit_code = 0 if len(stats['errors']) == 0 else 1
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        log.info("🛑 Nettoyage interrompu par l'utilisateur")
        sys.exit(130)
    except Exception as e:
        log.error(f"💥 Erreur fatale: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()