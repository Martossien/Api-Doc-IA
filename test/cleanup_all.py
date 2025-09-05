#!/usr/bin/env python3
"""
Purge vector store collections + delete all Files rows and underlying storage files.
Use with caution: resets the document state to avoid collection pollution.
"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path('backend')))

from open_webui.retrieval.vector.connector import VECTOR_DB_CLIENT
from open_webui.models.files import Files
from open_webui.storage.provider import Storage


def main():
    # Purge vector store
    cols = VECTOR_DB_CLIENT.client.list_collections() or []
    for c in cols:
        try:
            VECTOR_DB_CLIENT.delete_collection(collection_name=c)
            print(f"deleted collection: {c}")
        except Exception as e:
            print(f"error deleting collection {c}: {e}")

    # Delete files from DB
    try:
        Files.delete_all_files()
        print("deleted all files rows")
    except Exception as e:
        print(f"error deleting files rows: {e}")

    # Delete storage files
    try:
        Storage.delete_all_files()
        print("deleted all storage files")
    except Exception as e:
        print(f"error deleting storage files: {e}")


if __name__ == '__main__':
    main()

