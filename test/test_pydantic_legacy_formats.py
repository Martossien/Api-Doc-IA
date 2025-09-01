import os
import sys
import json
import time
import requests


TOKEN = os.environ.get(
    "API_DOC_IA_TOKEN",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI2ZjQ2MjM5LTUwNTUtNGMzZS1hOTg3LTZiYTk3YzI1ODMwZSIsImV4cCI6MTc1NzM1NjgzNH0.xRrnUCxMdq4mAH-kMRBo43TCZhHiOTHeE6MFWNjuu5Y",
)
HOST = os.environ.get("API_DOC_IA_HOST", "http://127.0.0.1:8080")


def _post_import(payload):
    urls = [
        f"{HOST}/api/configs/import",
        f"{HOST}/api/v1/configs/import",
        f"{HOST}/configs/import",
    ]
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}
    last = None
    for url in urls:
        try:
            r = requests.post(url, headers=headers, json={"config": payload}, timeout=10)
            if r.ok:
                return url, r.json()
            last = (url, r.status_code, r.text)
        except Exception as e:
            last = (url, None, str(e))
    raise RuntimeError(f"import failed: {last}")


def _get_admin_config():
    urls = [
        f"{HOST}/api/configs/api_v2/admin/config",
        f"{HOST}/api/v1/configs/api_v2/admin/config",
        f"{HOST}/configs/api_v2/admin/config",
    ]
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}
    last = None
    for url in urls:
        try:
            r = requests.get(url, headers=headers, timeout=10)
            if r.ok:
                return url, r.json()
            last = (url, r.status_code, r.text)
        except Exception as e:
            last = (url, None, str(e))
    raise RuntimeError(f"get admin config failed: {last}")


def main():
    legacy = {
        "api_v2.admin_config": {
            "temperature": 0.7,
            "max_tokens": 8000,
            # Intentionally mixed/uppercase to trigger migration normalization
            "supported_formats": ["pdf", "MP3", "WAV", "Docx"],
            # no supported_mime_types provided
        }
    }

    print("Posting legacy config...")
    imp_url, imp_resp = _post_import(legacy)
    print(f"Imported via {imp_url}")

    # Allow backend to persist
    time.sleep(0.5)

    print("Fetching migrated admin config...")
    cfg_url, cfg = _get_admin_config()
    print(f"Fetched via {cfg_url}")

    if not isinstance(cfg, dict):
        print("ERROR: Invalid response body")
        sys.exit(2)

    processing = cfg.get("processing", {})
    fmts = processing.get("supported_formats", [])

    # Normalize to strings
    fmts_norm = set([f.lower() if isinstance(f, str) else f for f in fmts])
    if not ("mp3" in fmts_norm and "wav" in fmts_norm and "pdf" in fmts_norm and "docx" in fmts_norm):
        print(f"ERROR: Migration missing expected formats, got: {sorted(fmts_norm)}")
        sys.exit(2)

    print("✅ Pydantic/migration test passed: uppercase legacy formats accepted")


if __name__ == "__main__":
    main()

