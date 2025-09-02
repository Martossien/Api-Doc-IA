# Open WebUI Account Migration Tool

This tool provides functionality to extract and re-integrate Open WebUI account data between database versions.

## Features

1. **Export** - Extract users, password hashes, API tokens, and groups from an Open WebUI database
2. **Init Fresh DB** - Initialize a fresh database with the current schema
3. **Import** - Import account data into a fresh database while preserving IDs and relationships
4. **Migrate** - Complete migration pipeline (stop → backup → export → init → import → start)

## Usage

### Export Data
```bash
conda activate api-doc-ia
cd /home/admin_ia/Api-Doc-IA/
python tools/migrate_openwebui.py export --db /home/admin_ia/Api-Doc-IA/backend/data/webui.db --out exports
```

### Initialize Fresh Database
```bash
python tools/migrate_openwebui.py init-fresh-db
```

### Import Data
```bash
python tools/migrate_openwebui.py import --target /home/admin_ia/Api-Doc-IA/backend/data/webui.new.db --bundle exports/export_bundle.json
```

### Complete Migration
```bash
python tools/migrate_openwebui.py migrate --db /home/admin_ia/Api-Doc-IA/backend/data/webui.db --out exports
```

## Output Files

After running the export command, the following files will be created in the export directory:

- `users.json` - User account data in JSON format
- `export_bundle.json` - Complete export bundle for import
- `users.csv` - User account data in CSV format
- `password_hashes.csv` - Password hashes with user identifiers
- `tokens.csv` - API tokens (masked by default)
- `groups.csv` - Group definitions
- `group_members.csv` - Group membership mappings
- `report.md` - Export summary with checksums and schema information

## Security Notes

- Password hashes are exported as-is and should be handled securely
- API tokens are masked in reports by default
- All exported files containing sensitive data are set to restrictive permissions (600)
- Backup files are automatically created before any modifications

## Testing

Run the test suite:
```bash
python test/test_migrate_openwebui.py
```