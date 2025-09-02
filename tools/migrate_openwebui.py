#!/usr/bin/env python3
"""
Open WebUI Account Migration Tool

This tool provides functionality to:
1. Export user accounts, password hashes, API tokens, and groups from an Open WebUI database
2. Initialize a fresh database with the current schema
3. Import account data into a fresh database while preserving IDs and relationships
4. Perform a complete migration pipeline (stop → backup → export → init → import → start)

Usage:
    python tools/migrate_openwebui.py export --db /path/to/webui.db --out exports
    python tools/migrate_openwebui.py init-fresh-db
    python tools/migrate_openwebui.py import --target /path/to/webui.new.db --bundle exports/export_bundle.json
    python tools/migrate_openwebui.py migrate --db /path/to/webui.db --out exports
"""

import argparse
import csv
import hashlib
import json
import logging
import os
import shutil
import sqlite3
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("migration_tool.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Constants
DEFAULT_DB_PATH = "/home/admin_ia/Api-Doc-IA/backend/data/webui.db"
DEFAULT_NEW_DB_PATH = "/home/admin_ia/Api-Doc-IA/backend/data/webui.new.db"
DEFAULT_EXPORT_DIR = "exports"
PROJECT_ROOT = "/home/admin_ia/Api-Doc-IA"
START_SCRIPT = os.path.join(PROJECT_ROOT, "start.sh")
STOP_SCRIPT = os.path.join(PROJECT_ROOT, "stop.sh")


def create_backup_path(filepath: str) -> str:
    """Create a backup filename with timestamp."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = Path(filepath)
    return f"{path.parent}/{path.stem}.backup-{timestamp}{path.suffix}"


def atomic_write_with_backup(path: str, data: bytes) -> None:
    """
    Write data to file atomically with backup creation.
    
    Args:
        path: Path to the file to write
        data: Data to write (bytes)
    """
    # Create backup if file exists
    if os.path.exists(path):
        backup_path = create_backup_path(path)
        shutil.copy2(path, backup_path)
        logger.info(f"Created backup: {backup_path}")
    
    # Write to temporary file first
    temp_path = f"{path}.tmp"
    try:
        with open(temp_path, "wb") as f:
            f.write(data)
        
        # Atomically move temp file to target
        os.rename(temp_path, path)
        logger.info(f"Atomically written: {path}")
    except Exception as e:
        # Clean up temp file if it exists
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise e


def get_db_schema(db_path: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get database schema information.
    
    Args:
        db_path: Path to the SQLite database
        
    Returns:
        Dictionary mapping table names to their column information
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get list of tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    
    # Get schema for each table
    schema = {}
    for table in tables:
        # Quote table names that might be reserved keywords
        quoted_table = f'"{table}"' if table.lower() in ['group', 'user', 'auth'] else table
        cursor.execute(f"PRAGMA table_info({quoted_table});")
        schema[table] = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return schema


def export_data(db_path: str, export_dir: str, snapshot: bool = False, 
                include_secrets: bool = False) -> None:
    """
    Export user accounts, password hashes, API tokens, and groups from database.
    
    Args:
        db_path: Path to the source database
        export_dir: Directory to export data to
        snapshot: Whether to create a snapshot copy of the database
        include_secrets: Whether to include full secrets in reports
    """
    logger.info(f"Exporting data from {db_path}")
    
    # Create export directory
    os.makedirs(export_dir, exist_ok=True)
    
    # Create snapshot if requested
    if snapshot:
        snapshot_path = f"{db_path}.snapshot"
        atomic_write_with_backup(snapshot_path, Path(db_path).read_bytes())
        db_path = snapshot_path
        logger.info(f"Created snapshot: {snapshot_path}")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        # Get schema information
        schema = get_db_schema(db_path)
        logger.info(f"Database schema: {list(schema.keys())}")
        
        # Export users
        cursor.execute("""
            SELECT id, name, email, role, profile_image_url, api_key, last_active_at, 
                   created_at, updated_at, settings, info, oauth_sub
            FROM user
        """)
        users = [dict(row) for row in cursor.fetchall()]
        
        # Export auth (password hashes)
        cursor.execute("""
            SELECT id, email, password, active
            FROM auth
        """)
        auths = [dict(row) for row in cursor.fetchall()]
        
        # Export groups
        cursor.execute('''
            SELECT id, user_id, name, description, user_ids, permissions, 
                   created_at, updated_at, data, meta
            FROM "group"
        ''')
        groups = [dict(row) for row in cursor.fetchall()]
        
        # Export group memberships (explode JSON)
        cursor.execute('''
            SELECT g.id as group_id, g.name as group_name, 
                   json_each.value as user_id
            FROM "group" g, json_each(g.user_ids)
        ''')
        group_members_raw = [dict(row) for row in cursor.fetchall()]
        
        # Get user details for group members
        user_lookup = {user['id']: user for user in users}
        group_members = []
        for member in group_members_raw:
            user = user_lookup.get(member['user_id'])
            if user:
                group_members.append({
                    'group_id': member['group_id'],
                    'group_name': member['group_name'],
                    'user_id': member['user_id'],
                    'user_email': user['email'],
                    'user_name': user['name']
                })
        
        # Write exports
        exports = {
            'users': users,
            'auths': auths,
            'groups': groups,
            'group_members': group_members,
            'export_timestamp': datetime.now().isoformat(),
            'source_db': db_path
        }
        
        # Write JSON exports
        users_json_path = os.path.join(export_dir, "users.json")
        atomic_write_with_backup(users_json_path, json.dumps(users, indent=2).encode('utf-8'))
        
        export_bundle_path = os.path.join(export_dir, "export_bundle.json")
        atomic_write_with_backup(export_bundle_path, json.dumps(exports, indent=2).encode('utf-8'))
        
        # Write CSV exports
        users_csv_path = os.path.join(export_dir, "users.csv")
        if users:
            with open(f"{users_csv_path}.tmp", "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=users[0].keys())
                writer.writeheader()
                writer.writerows(users)
            os.rename(f"{users_csv_path}.tmp", users_csv_path)
            os.chmod(users_csv_path, 0o600)
        
        # Password hashes CSV
        password_hashes_path = os.path.join(export_dir, "password_hashes.csv")
        with open(f"{password_hashes_path}.tmp", "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["user_id", "email", "password_hash", "source_table"])
            for auth in auths:
                writer.writerow([
                    auth["id"], 
                    auth["email"], 
                    auth["password"], 
                    "auth"
                ])
        os.rename(f"{password_hashes_path}.tmp", password_hashes_path)
        os.chmod(password_hashes_path, 0o600)
        
        # Tokens CSV (mask if not including secrets)
        tokens_path = os.path.join(export_dir, "tokens.csv")
        with open(f"{tokens_path}.tmp", "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["user_id", "email", "api_key"])
            for user in users:
                api_key = user["api_key"]
                if api_key and not include_secrets:
                    # Mask all but last 4 characters
                    api_key = "*" * (len(api_key) - 4) + api_key[-4:] if len(api_key) > 4 else "*" * len(api_key)
                writer.writerow([user["id"], user["email"], api_key])
        os.rename(f"{tokens_path}.tmp", tokens_path)
        os.chmod(tokens_path, 0o600)
        
        # Groups CSV
        groups_csv_path = os.path.join(export_dir, "groups.csv")
        if groups:
            with open(f"{groups_csv_path}.tmp", "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=groups[0].keys())
                writer.writeheader()
                writer.writerows(groups)
            os.rename(f"{groups_csv_path}.tmp", groups_csv_path)
        
        # Group members CSV
        group_members_path = os.path.join(export_dir, "group_members.csv")
        if group_members:
            with open(f"{group_members_path}.tmp", "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=group_members[0].keys())
                writer.writeheader()
                writer.writerows(group_members)
            os.rename(f"{group_members_path}.tmp", group_members_path)
        
        # Generate report
        report_path = os.path.join(export_dir, "report.md")
        with open(f"{report_path}.tmp", "w", encoding="utf-8") as f:
            f.write("# Open WebUI Data Export Report\n\n")
            f.write(f"Export Timestamp: {exports['export_timestamp']}\n\n")
            f.write(f"Source Database: {exports['source_db']}\n\n")
            f.write("## Summary\n")
            f.write(f"- Users: {len(users)}\n")
            f.write(f"- Auth Records: {len(auths)}\n")
            f.write(f"- Groups: {len(groups)}\n")
            f.write(f"- Group Memberships: {len(group_members)}\n\n")
            
            f.write("## Schema Information\n")
            for table, columns in schema.items():
                f.write(f"### {table}\n")
                for col in columns:
                    f.write(f"- {col['name']} ({col['type']})\n")
                f.write("\n")
            
            f.write("## File Checksums\n")
            for filename in os.listdir(export_dir):
                if filename.endswith(('.json', '.csv')):
                    filepath = os.path.join(export_dir, filename)
                    with open(filepath, "rb") as file:
                        sha256 = hashlib.sha256(file.read()).hexdigest()
                    f.write(f"- {filename}: {sha256}\n")
            
            f.write("\n## Warnings\n")
            f.write("- Password hashes are exported as-is. Never store these in plain text.\n")
            f.write("- API keys are masked in this report unless --include-secrets was used.\n")
        
        os.rename(f"{report_path}.tmp", report_path)
        
        logger.info(f"Export completed successfully to {export_dir}")
        logger.info(f"  Users: {len(users)}")
        logger.info(f"  Auth records: {len(auths)}")
        logger.info(f"  Groups: {len(groups)}")
        logger.info(f"  Group memberships: {len(group_members)}")
        
    finally:
        conn.close()


def init_fresh_db() -> str:
    """
    Initialize a fresh database with the current schema by:
    1. Stopping the service
    2. Backing up the current database
    3. Starting the service to create a new database
    4. Stopping the service again
    5. Copying the fresh database to the target location
    
    Returns:
        Path to the fresh database
    """
    logger.info("Initializing fresh database")
    
    # Stop the service
    logger.info("Stopping service...")
    result = subprocess.run([STOP_SCRIPT], cwd=PROJECT_ROOT, capture_output=True, text=True)
    if result.returncode != 0:
        logger.warning(f"Stop script returned {result.returncode}: {result.stderr}")
    
    # Backup current database
    if os.path.exists(DEFAULT_DB_PATH):
        backup_path = create_backup_path(DEFAULT_DB_PATH)
        shutil.copy2(DEFAULT_DB_PATH, backup_path)
        logger.info(f"Backed up current database to {backup_path}")
    
    # Start service to create fresh database
    logger.info("Starting service to create fresh database...")
    result = subprocess.run([START_SCRIPT], cwd=PROJECT_ROOT, capture_output=True, text=True)
    if result.returncode != 0:
        logger.error(f"Start script failed: {result.stderr}")
        raise Exception(f"Failed to start service: {result.stderr}")
    
    # Wait a moment for database to be created
    time.sleep(5)
    
    # Stop service again
    logger.info("Stopping service...")
    result = subprocess.run([STOP_SCRIPT], cwd=PROJECT_ROOT, capture_output=True, text=True)
    if result.returncode != 0:
        logger.warning(f"Stop script returned {result.returncode}: {result.stderr}")
    
    # Copy fresh database to target location
    if os.path.exists(DEFAULT_DB_PATH):
        shutil.copy2(DEFAULT_DB_PATH, DEFAULT_NEW_DB_PATH)
        logger.info(f"Copied fresh database to {DEFAULT_NEW_DB_PATH}")
        
        # Set restrictive permissions
        os.chmod(DEFAULT_NEW_DB_PATH, 0o600)
        return DEFAULT_NEW_DB_PATH
    else:
        raise Exception(f"Fresh database not found at {DEFAULT_DB_PATH}")


def import_data(target_db: str, bundle_path: str, force: bool = False, 
                remap: bool = False) -> None:
    """
    Import data from export bundle into target database.
    
    Args:
        target_db: Path to the target database
        bundle_path: Path to the export bundle JSON file
        force: Whether to import even if target database is not empty
        remap: Whether to remap IDs if conflicts are found
    """
    logger.info(f"Importing data to {target_db} from {bundle_path}")
    
    # Check if target database exists
    if not os.path.exists(target_db):
        raise Exception(f"Target database does not exist: {target_db}")
    
    # Connect to target database
    conn = sqlite3.connect(target_db)
    conn.execute("PRAGMA foreign_keys=ON")
    cursor = conn.cursor()
    
    try:
        # Check if target is empty
        cursor.execute("SELECT COUNT(*) FROM user")
        user_count = cursor.fetchone()[0]
        
        if user_count > 0 and not force:
            raise Exception(f"Target database is not empty ({user_count} users). Use --force to override.")
        
        # Load export bundle
        with open(bundle_path, "r", encoding="utf-8") as f:
            exports = json.load(f)
        
        users = exports["users"]
        auths = exports["auths"]
        groups = exports["groups"]
        group_members = exports["group_members"]
        
        logger.info(f"Loaded export data: {len(users)} users, {len(auths)} auths, {len(groups)} groups")
        
        # Start transaction
        conn.execute("BEGIN TRANSACTION")
        
        try:
            # Import users (preserve IDs)
            logger.info("Importing users...")
            for user in users:
                cursor.execute("""
                    INSERT INTO user (id, name, email, role, profile_image_url, 
                                    api_key, last_active_at, created_at, updated_at, 
                                    settings, info, oauth_sub)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user["id"], user["name"], user["email"], user["role"],
                    user["profile_image_url"], user["api_key"], user["last_active_at"],
                    user["created_at"], user["updated_at"], user.get("settings", "{}"),
                    user.get("info", "{}"), user.get("oauth_sub")
                ))
            
            # Import auth records (password hashes)
            logger.info("Importing auth records...")
            for auth in auths:
                cursor.execute("""
                    INSERT INTO auth (id, email, password, active)
                    VALUES (?, ?, ?, ?)
                """, (
                    auth["id"], auth["email"], auth["password"], auth["active"]
                ))
            
            # Import groups
            logger.info("Importing groups...")
            for group in groups:
                cursor.execute('''
                    INSERT INTO "group" (id, user_id, name, description, user_ids, 
                                       permissions, created_at, updated_at, data, meta)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    group["id"], group.get("user_id"), group.get("name"), group.get("description"),
                    group.get("user_ids"), group.get("permissions"), group.get("created_at"),
                    group.get("updated_at"), group.get("data", "{}"), group.get("meta", "{}")
                ))
            
            # Commit transaction
            conn.commit()
            logger.info("Import completed successfully")
            
            # Verify integrity
            cursor.execute("PRAGMA integrity_check")
            integrity_result = cursor.fetchone()[0]
            if integrity_result != "ok":
                raise Exception(f"Database integrity check failed: {integrity_result}")
            
            # Recount and verify
            cursor.execute("SELECT COUNT(*) FROM user")
            final_user_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM auth")
            final_auth_count = cursor.fetchone()[0]
            cursor.execute('SELECT COUNT(*) FROM "group"')
            final_group_count = cursor.fetchone()[0]
            
            logger.info(f"Final counts - Users: {final_user_count}, Auths: {final_auth_count}, Groups: {final_group_count}")
            
            # Set restrictive permissions
            os.chmod(target_db, 0o600)
            
        except Exception as e:
            conn.rollback()
            raise e
            
    finally:
        conn.close()


def migrate_pipeline(db_path: str, export_dir: str) -> None:
    """
    Perform complete migration pipeline:
    1. Stop service
    2. Export data (with snapshot)
    3. Initialize fresh database
    4. Import data
    5. Start service
    
    Args:
        db_path: Path to the source database
        export_dir: Directory to export data to
    """
    start_time = time.time()
    logger.info("Starting migration pipeline")
    
    # Create export directory
    os.makedirs(export_dir, exist_ok=True)
    
    try:
        # Stop service
        logger.info("Stopping service...")
        result = subprocess.run([STOP_SCRIPT], cwd=PROJECT_ROOT, capture_output=True, text=True)
        if result.returncode != 0:
            logger.warning(f"Stop script returned {result.returncode}: {result.stderr}")
        
        # Export data with snapshot
        export_data(db_path, export_dir, snapshot=True, include_secrets=False)
        
        # Initialize fresh database
        fresh_db_path = init_fresh_db()
        
        # Import data
        bundle_path = os.path.join(export_dir, "export_bundle.json")
        import_data(fresh_db_path, bundle_path)
        
        # Swap databases
        backup_path = create_backup_path(DEFAULT_DB_PATH)
        shutil.copy2(DEFAULT_DB_PATH, backup_path)
        logger.info(f"Backed up current database to {backup_path}")
        
        shutil.copy2(fresh_db_path, DEFAULT_DB_PATH)
        logger.info(f"Swapped fresh database into place")
        
        # Start service
        logger.info("Starting service...")
        result = subprocess.run([START_SCRIPT], cwd=PROJECT_ROOT, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"Start script failed: {result.stderr}")
            raise Exception(f"Failed to start service: {result.stderr}")
        
        # Generate migration report
        end_time = time.time()
        duration = end_time - start_time
        
        report_path = os.path.join(export_dir, "REPORT_MIGRATION.md")
        with open(f"{report_path}.tmp", "w", encoding="utf-8") as f:
            f.write("# Open WebUI Migration Report\n\n")
            f.write(f"Migration Timestamp: {datetime.now().isoformat()}\n\n")
            f.write("## Migration Summary\n")
            f.write(f"- Source Database: {db_path}\n")
            f.write(f"- Target Database: {DEFAULT_DB_PATH}\n")
            f.write(f"- Export Directory: {export_dir}\n")
            f.write(f"- Duration: {duration:.2f} seconds\n\n")
            
            # Load export data for summary
            bundle_path = os.path.join(export_dir, "export_bundle.json")
            with open(bundle_path, "r", encoding="utf-8") as bundle_file:
                exports = json.load(bundle_file)
            
            f.write("## Data Summary\n")
            f.write(f"- Users: {len(exports['users'])}\n")
            f.write(f"- Auth Records: {len(exports['auths'])}\n")
            f.write(f"- Groups: {len(exports['groups'])}\n")
            f.write(f"- Group Memberships: {len(exports['group_members'])}\n\n")
            
            f.write("## File Checksums\n")
            for filename in os.listdir(export_dir):
                if filename.endswith(('.json', '.csv')):
                    filepath = os.path.join(export_dir, filename)
                    with open(filepath, "rb") as file:
                        sha256 = hashlib.sha256(file.read()).hexdigest()
                    f.write(f"- {filename}: {sha256}\n")
            
            f.write("\n## Post-Migration Verification\n")
            f.write("1. Check that the service is running correctly\n")
            f.write("2. Verify user accounts can log in\n")
            f.write("3. Confirm group memberships are preserved\n")
            f.write("4. Test API key functionality\n\n")
            
            f.write("## Next Steps\n")
            f.write("1. Monitor logs for any errors\n")
            f.write("2. Test critical functionality with a few user accounts\n")
            f.write("3. Verify backups have been created\n")
        
        os.rename(f"{report_path}.tmp", report_path)
        logger.info(f"Migration completed successfully in {duration:.2f} seconds")
        logger.info(f"Migration report saved to {report_path}")
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        # Try to restart service even if migration failed
        try:
            logger.info("Attempting to restart service...")
            result = subprocess.run([START_SCRIPT], cwd=PROJECT_ROOT, capture_output=True, text=True)
            if result.returncode != 0:
                logger.error(f"Failed to restart service: {result.stderr}")
        except Exception as restart_error:
            logger.error(f"Failed to restart service after migration failure: {restart_error}")
        raise e


def main():
    """Main entry point for the migration tool."""
    parser = argparse.ArgumentParser(description="Open WebUI Account Migration Tool")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Export command
    export_parser = subparsers.add_parser("export", help="Export account data")
    export_parser.add_argument("--db", default=DEFAULT_DB_PATH, 
                              help="Source database path")
    export_parser.add_argument("--out", default=DEFAULT_EXPORT_DIR,
                              help="Export directory")
    export_parser.add_argument("--snapshot", action="store_true",
                              help="Create snapshot copy of database")
    export_parser.add_argument("--include-secrets", action="store_true",
                              help="Include full secrets in output")
    
    # Init fresh DB command
    init_parser = subparsers.add_parser("init-fresh-db", 
                                       help="Initialize a fresh database")
    
    # Import command
    import_parser = subparsers.add_parser("import", help="Import account data")
    import_parser.add_argument("--target", default=DEFAULT_NEW_DB_PATH,
                              help="Target database path")
    import_parser.add_argument("--bundle", required=True,
                              help="Export bundle JSON file")
    import_parser.add_argument("--force", action="store_true",
                              help="Import even if target is not empty")
    import_parser.add_argument("--remap", action="store_true",
                              help="Remap IDs if conflicts found")
    
    # Migrate command
    migrate_parser = subparsers.add_parser("migrate", 
                                          help="Complete migration pipeline")
    migrate_parser.add_argument("--db", default=DEFAULT_DB_PATH,
                               help="Source database path")
    migrate_parser.add_argument("--out", default=DEFAULT_EXPORT_DIR,
                               help="Export directory")
    
    args = parser.parse_args()
    
    if args.command == "export":
        export_data(args.db, args.out, args.snapshot, args.include_secrets)
    elif args.command == "init-fresh-db":
        init_fresh_db()
    elif args.command == "import":
        import_data(args.target, args.bundle, args.force, args.remap)
    elif args.command == "migrate":
        migrate_pipeline(args.db, args.out)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()