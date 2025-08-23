#!/usr/bin/env python3
"""
Verification protocol script for content transmission to LLM (read-only).

Runs controlled requests against the API to check whether the LLM receives
actual file content (via sources with non-empty documents) under two flows:

1) v2 flow: POST /api/v2/process + poll /api/v2/status/{task_id}
2) v1 flow: POST /api/v1/files?process=true -> POST /api/chat/completions

Usage examples:
  - python verify_content_transmission.py --mode v2 --file path/to/file.txt
  - python verify_content_transmission.py --mode v1 --file path/to/file.txt
  - python verify_content_transmission.py --mode both --file path/to/file.txt --repeat 3

This script does NOT modify the server. It only performs client requests.
"""

import argparse
import json
import time
from pathlib import Path
from typing import Any, Dict, Optional

import requests


DEFAULT_BASE_URL = "http://localhost:8080"
DEFAULT_PROMPT = "Analyse ce document et renvoie UNIQUEMENT un JSON compact."


def post_v2_process(base_url: str, token: str, file_path: Path, prompt: str, http_timeout: int = 60) -> Dict[str, Any]:
    headers = {"Authorization": f"Bearer {token}"}
    with open(file_path, "rb") as fh:
        files = {"file": (file_path.name, fh)}
        data = {"prompt": prompt}
        resp = requests.post(f"{base_url}/api/v2/process", headers=headers, files=files, data=data, timeout=http_timeout)
    resp.raise_for_status()
    return resp.json()


def get_v2_status(base_url: str, token: str, task_id: str, http_timeout: int = 60, timeout: int = 300) -> Dict[str, Any]:
    headers = {"Authorization": f"Bearer {token}"}
    start = time.time()
    while True:
        if time.time() - start > timeout:
            raise TimeoutError(f"Global timeout while polling status for task {task_id}")
        r = requests.get(f"{base_url}/api/v2/status/{task_id}", headers=headers, timeout=http_timeout)
        if r.status_code == 200:
            payload = r.json()
            status = payload.get("status")
            if status in {"completed", "failed"}:
                return payload
        time.sleep(1)


def post_v1_upload_process(base_url: str, token: str, file_path: Path, http_timeout: int = 60) -> Dict[str, Any]:
    """Upload to v1 and trigger processing (process=true). Returns file model JSON."""
    headers = {"Authorization": f"Bearer {token}"}
    params = {"process": "true"}
    with open(file_path, "rb") as fh:
        files = {"file": (file_path.name, fh)}
        # Note the trailing slash to avoid 405
        r = requests.post(f"{base_url}/api/v1/files/", headers=headers, params=params, files=files, timeout=http_timeout)
    r.raise_for_status()
    return r.json()


def post_v1_chat_full(base_url: str, token: str, file_id: str, prompt: str, model: Optional[str] = None, http_timeout: int = 120) -> Dict[str, Any]:
    """Call /api/chat/completions with context='full' for the given file id."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    body: Dict[str, Any] = {
        "model": model or "auto",
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "metadata": {
            "files": [
                {
                    "id": file_id,
                    "context": "full",
                }
            ]
        },
    }

    r = requests.post(f"{base_url}/api/chat/completions", headers=headers, data=json.dumps(body), timeout=http_timeout)
    r.raise_for_status()
    return r.json()


def analyze_sources(result: Dict[str, Any]) -> Dict[str, Any]:
    """Return basic stats about sources if present in result."""
    out = {
        "has_sources": False,
        "sources_count": None,
        "any_document_non_empty": None,
        "content_preview": None,
        "content_length": None,
    }
    res = result or {}

    content = res.get("result", {}).get("content") if "status" in res else res.get("choices", [{}])[0].get("message", {}).get("content")
    if isinstance(content, str):
        out["content_length"] = len(content)
        out["content_preview"] = content[:120].replace("\n", " ")

    # v2: adapter includes 'sources' inside result
    sources = res.get("result", {}).get("sources") if "result" in res else None
    if sources is None:
        # v1 may not return 'sources' in the same shape; we only check v2 here
        return out

    out["has_sources"] = True
    out["sources_count"] = len(sources)
    any_non_empty = False
    try:
        for s in sources:
            doc = s.get("document", [])
            if isinstance(doc, list) and len(doc) > 0:
                # If first page has non-empty text
                joined = "".join(x for x in doc if isinstance(x, str))
                if joined.strip():
                    any_non_empty = True
                    break
    except Exception:
        pass
    out["any_document_non_empty"] = any_non_empty
    return out


def run_once(mode: str, base_url: str, token: str, file_path: Path, prompt: str) -> Dict[str, Any]:
    if mode == "v2":
        start = time.time()
        proc = post_v2_process(base_url, token, file_path, prompt)
        task_id = proc.get("task_id")
        status = get_v2_status(base_url, token, task_id)
        stats = analyze_sources(status)
        stats.update({
            "mode": mode,
            "task_id": task_id,
            "elapsed": round(time.time() - start, 2),
            "http_result_status": status.get("status"),
        })
        return stats
    elif mode == "v1":
        start = time.time()
        up = post_v1_upload_process(base_url, token, file_path)
        file_id = up.get("id") or up.get("data", {}).get("id") or up.get("file", {}).get("id")
        chat = post_v1_chat_full(base_url, token, file_id, prompt)
        # v1 result parsing focuses on content only
        stats = analyze_sources(chat)
        stats.update({
            "mode": mode,
            "file_id": file_id,
            "elapsed": round(time.time() - start, 2),
            "http_result_status": "completed" if chat else "unknown",
        })
        return stats
    else:
        raise ValueError("mode must be 'v2' or 'v1'")


def main():
    ap = argparse.ArgumentParser(description="Verify if LLM receives file content (sources != empty)")
    ap.add_argument("--mode", choices=["v1", "v2", "both"], default="v2")
    ap.add_argument("--file", required=True, help="Path to test file")
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL)
    ap.add_argument("--token", default="sk-d88e3244ae2e4b64a5256c6f4946155a")
    ap.add_argument("--prompt", default=DEFAULT_PROMPT)
    ap.add_argument("--repeat", type=int, default=1)
    args = ap.parse_args()

    file_path = Path(args.file)
    if not file_path.exists():
        raise SystemExit(f"File not found: {file_path}")

    modes = [args.mode] if args.mode != "both" else ["v2", "v1"]

    all_stats = []
    for i in range(args.repeat):
        for mode in modes:
            try:
                stats = run_once(mode, args.base_url, args.token, file_path, args.prompt)
                all_stats.append(stats)
                print(json.dumps(stats, ensure_ascii=False))
            except Exception as e:
                print(json.dumps({"mode": mode, "error": str(e)}))

    # Basic summary
    summary = {"runs": len(all_stats), "v2_non_empty_docs": 0}
    for s in all_stats:
        if s.get("mode") == "v2" and s.get("any_document_non_empty"):
            summary["v2_non_empty_docs"] += 1
    print("SUMMARY:", json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
