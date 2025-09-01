import os
import sys
import json
import requests


TOKEN = os.environ.get(
    "API_DOC_IA_TOKEN",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI2ZjQ2MjM5LTUwNTUtNGMzZS1hOTg3LTZiYTk3YzI1ODMwZSIsImV4cCI6MTc1NzM1NjgzNH0.xRrnUCxMdq4mAH-kMRBo43TCZhHiOTHeE6MFWNjuu5Y",
)
HOST = os.environ.get("API_DOC_IA_HOST", "http://127.0.0.1:8080")


def get_admin_config():
    paths = [
        f"{HOST}/api/configs/api_v2/admin/config",
        f"{HOST}/api/v1/configs/api_v2/admin/config",
        f"{HOST}/configs/api_v2/admin/config",
    ]
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}
    last_err = None
    for url in paths:
        try:
            r = requests.get(url, headers=headers, timeout=10)
            if r.ok:
                return url, r.json()
            last_err = (r.status_code, r.text)
        except Exception as e:
            last_err = (None, str(e))
    raise RuntimeError(f"All endpoints failed: {last_err}")


def main():
    try:
        url, data = get_admin_config()
        print(f"OK: fetched config from {url}")

        # Basic validations
        processing = data.get("processing", {}) if isinstance(data, dict) else {}
        fmts = processing.get("supported_formats", [])
        mimes = processing.get("supported_mime_types", [])

        # Normalize file formats to set of strings
        fmts_norm = set([f.lower() if isinstance(f, str) else f for f in fmts])

        expected_exts = {"mp3", "wav", "ogg", "m4a", "flac", "aac", "opus", "webm"}
        missing = expected_exts - fmts_norm
        print(f"supported_formats contains {len(fmts_norm)} items; missing: {sorted(missing)}")

        expected_mimes = {"audio/mpeg", "audio/wav", "audio/ogg", "audio/x-m4a", "audio/webm"}
        mimes_norm = set(mimes)
        missing_mime = expected_mimes - mimes_norm
        print(f"supported_mime_types: {sorted(mimes_norm)}; missing: {sorted(missing_mime)}")

        # Exit with non-zero if critical fields absent
        if missing and len(expected_exts - {"flac", "aac", "opus"}) & missing:
            print("ERROR: Required audio extensions missing in config.")
            sys.exit(2)
        if not mimes_norm.intersection({"audio/mpeg", "audio/wav", "audio/ogg", "audio/x-m4a"}):
            print("ERROR: No core audio MIME types present.")
            sys.exit(2)

        print("✅ Config validation passed (audio formats + MIME types)")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

