#!/usr/bin/env python3
"""
Parse and summarize API v2 task logs from api_doc_ia_startup.log.

Usage examples:
  - python parse_api_v2_logs.py --task-id <UUID>
  - python parse_api_v2_logs.py --last 3
  - python parse_api_v2_logs.py --since-line 7000 --last 5
"""

import argparse
import re
from pathlib import Path
from typing import List, Dict, Any


UUID_RE = re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b")


def load_lines(path: Path) -> List[str]:
    return path.read_text(encoding="utf-8", errors="ignore").splitlines()


def find_recent_task_ids(lines: List[str], last: int = 3) -> List[str]:
    ids: List[str] = []
    for line in reversed(lines):
        if "Starting background processing for task" in line:
            m = UUID_RE.search(line)
            if m:
                tid = m.group(0)
                if tid not in ids:
                    ids.append(tid)
                    if len(ids) >= last:
                        break
    return list(reversed(ids))


def summarize_task(lines: List[str], task_id: str) -> Dict[str, Any]:
    summary: Dict[str, Any] = {
        "task_id": task_id,
        "phase2_start": 0,
        "files_handler_success": 0,
        "completed": False,
        "failed": False,
        "sources_count": None,
        "document_empty": None,
        "file_name": None,
        "file_type": None,
        "response_length": None,
        "model_used": None,
        "last_status_line": None,
    }

    for line in lines:
        if task_id not in line:
            continue

        if "PHASE 2: Starting API v1 wrapper" in line:
            summary["phase2_start"] += 1

        if "STEP 2 SUCCESS: chat_completion_files_handler()" in line:
            summary["files_handler_success"] += 1

        if "Updated task" in line and "'status': 'completed'" in line:
            summary["completed"] = True
            summary["last_status_line"] = line

            # sources_count
            m = re.search(r"'sources_count':\s*(\d+)", line)
            if m:
                summary["sources_count"] = int(m.group(1))

            # document empty?
            # Look for "'document': []" in the sources structure
            summary["document_empty"] = ("'document': []" in line)

            # response_length
            m = re.search(r"'response_length':\s*(\d+)", line)
            if m:
                summary["response_length"] = int(m.group(1))

            # model_used
            m = re.search(r"'model_used':\s*'([^']+)'", line)
            if m:
                summary["model_used"] = m.group(1)

            # file_info
            m = re.search(r"'file_info':\s*\{[^}]*'filename':\s*'([^']+)'[^}]*'type':\s*'([^']+)'", line)
            if m:
                summary["file_name"], summary["file_type"] = m.group(1), m.group(2)

        if "Updated task" in line and "'status': 'failed'" in line:
            summary["failed"] = True
            summary["last_status_line"] = line

    return summary


def print_summary(summary: Dict[str, Any]) -> None:
    print(f"Task: {summary['task_id']}")
    print(f"  PHASE2 starts:         {summary['phase2_start']}")
    print(f"  Files handler success: {summary['files_handler_success']}")
    print(f"  Completed:             {summary['completed']}")
    print(f"  Failed:                {summary['failed']}")
    print(f"  Model used:            {summary['model_used']}")
    print(f"  File:                  {summary['file_name']} ({summary['file_type']})")
    print(f"  Sources count:         {summary['sources_count']}")
    print(f"  Document empty?:       {summary['document_empty']}")
    print(f"  Response length:       {summary['response_length']}")
    if summary.get("last_status_line"):
        print("  Last status line (truncated):")
        print("    " + summary["last_status_line"][:200])


def main():
    parser = argparse.ArgumentParser(description="Parse API v2 task logs")
    parser.add_argument("--log", default="api_doc_ia_startup.log", help="Path to log file")
    parser.add_argument("--task-id", help="Task ID to summarize")
    parser.add_argument("--last", type=int, default=3, help="Summarize last N tasks")
    parser.add_argument("--since-line", type=int, default=0, help="Start parsing at this line number (1-based)")
    args = parser.parse_args()

    path = Path(args.log)
    if not path.exists():
        print(f"Log file not found: {path}")
        return

    lines = load_lines(path)
    if args.since_line > 0:
        idx = max(0, args.since_line - 1)
        lines = lines[idx:]

    task_ids: List[str]
    if args.task_id:
        task_ids = [args.task_id]
    else:
        task_ids = find_recent_task_ids(lines, last=args.last)

    if not task_ids:
        print("No tasks found in the given window.")
        return

    for tid in task_ids:
        summary = summarize_task(lines, tid)
        print_summary(summary)
        print()


if __name__ == "__main__":
    main()

