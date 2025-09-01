import os
import sys
import json
import requests


HOST = os.environ.get("API_DOC_IA_HOST", "http://127.0.0.1:8080")
TOKEN = os.environ.get("API_DOC_IA_TOKEN", "")


def get_admin_config(base):
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}
    for path in ("/api/configs/api_v2/admin/config", "/configs/api_v2/admin/config"):
        url = base + path
        r = requests.get(url, headers=headers, timeout=10)
        if r.ok:
            return url, r.json()
    raise RuntimeError("Cannot fetch admin config")


def set_admin_config(base, config):
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}
    body = {"config": config, "backup_current": True, "reason": "Update supported_mime_types"}
    for path in ("/api/configs/api_v2/admin/config", "/configs/api_v2/admin/config"):
        url = base + path
        r = requests.post(url, headers=headers, json=body, timeout=10)
        if r.ok:
            return url, r.json()
    raise RuntimeError("Cannot set admin config")


def main():
    if not TOKEN:
        print("Please set API_DOC_IA_TOKEN")
        sys.exit(2)
    if len(sys.argv) < 2:
        print("Usage: set_audio_mime_types.py mime1,mime2,...")
        sys.exit(2)

    mime_list = [m.strip() for m in sys.argv[1].split(',') if m.strip()]
    _, cfg = get_admin_config(HOST)
    if not isinstance(cfg, dict):
        raise RuntimeError("Invalid config response")

    processing = cfg.get("processing", {})
    processing["supported_mime_types"] = mime_list
    cfg["processing"] = processing
    _, updated = set_admin_config(HOST, cfg)
    print(json.dumps(updated.get("processing", {}).get("supported_mime_types", []), indent=2))


if __name__ == "__main__":
    main()

