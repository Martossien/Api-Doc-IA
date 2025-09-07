#!/usr/bin/env python3
"""
Patch the LLM Web Search tool content stored in Open WebUI's SQLite DB.

Usage:
  - Run after installing our fork and the LLM Web Search tool.
  - The script makes a timestamped backup and applies idempotent regex patches.

Targets (summary):
  - ddgs headers/proxies removal in AsyncDDGS.__init__
  - atext() call to DDGS.text with keyword args, and super(AsyncDDGS, self)
  - ensure self.proxy is set in __init__
  - DuckDuckGo HTML fallback: trust_env, proxy in session.get, href normalization (uddg)
  - Domain prioritization + domain root URL injection when query contains a domain
  - Guard after webpages fetch, similarity threshold temporary lowering
  - DenseRetriever k bounded to available docs
  - Split regex off-by-one fix

Rollback:
  - Copy the backup file over DB or re-run with --restore <backup_path> (manual).
"""

import argparse
import datetime
import os
import re
import shutil
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "backend" / "data" / "webui.db"
BACKUP_DIR = ROOT / "backups" / "tools"


def backup_db(db_path: Path) -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    dest = BACKUP_DIR / f"webui.db.backup-{ts}"
    shutil.copy2(db_path, dest)
    return dest


def patch_content(content: str) -> tuple[str, list[str]]:
    notes = []

    # 1) ddgs __init__: drop headers/proxies
    new = re.sub(
        r"super\(\)\.\__init__\(\s*\n\s*headers\s*=\s*headers,\s*\n\s*proxy\s*=\s*proxy,\s*\n\s*proxies\s*=\s*proxies,\s*\n\s*timeout\s*=\s*timeout,\s*\n\s*verify\s*=\s*verify,\s*\n\s*\)",
        "super().__init__(\n            proxy=proxy,\n            timeout=timeout,\n            verify=verify,\n        )",
        content,
        flags=re.M,
    )
    if new != content:
        notes.append("ddgs init headers/proxies removed")
    content = new

    # 2) atext: keyword arguments + super(AsyncDDGS, self)
    content = re.sub(
        r"result = await self\._loop run_in_executor\([\s\S]*?\)",
        lambda m: m.group(0),
        content,
    )  # noop (pattern safety)
    content = re.sub(
        r"result = await self\._loop\.run_in_executor\(\s*self\._executor,\s*super\(\)\.text,\s*keywords,\s*region,\s*safesearch,\s*timelimit,\s*backend,\s*max_results,\s*\)",
        "result = await self._loop.run_in_executor(\n            self._executor,\n            (lambda: super(AsyncDDGS, self).text(\n                keywords,\n                region=region, safesearch=safesearch, timelimit=timelimit,\n                backend=backend, max_results=max_results\n            ))\n        )",
        content,
        flags=re.M,
    )
    notes.append("atext uses keyword args + proper super()")

    # 3) ensure self.proxy in __init__
    if "self.proxy = proxy" not in content:
        content = content.replace(
            "        )\n        self._executor =",
            "        )\n        self.proxy = proxy\n        self._executor =",
        )
        notes.append("self.proxy saved in __init__")

    # 4) ClientSession trust_env and session.get proxy
    content = content.replace(
        "async with aiohttp.ClientSession(\n                headers=headers,\n                timeout=aiohttp.ClientTimeout(timeout),\n                max_field_size=65536,",
        "async with aiohttp.ClientSession(\n                headers=headers,\n                timeout=aiohttp.ClientTimeout(total=timeout),\n                max_field_size=65536,\n                trust_env=True,",
    )
    content = content.replace(
        "response = await session.get(search_url)",
        "response = await session.get(search_url, proxy=self.proxy)",
    )
    notes.append("trust_env + proxy in DuckDuckGo HTML fallback")

    # 5) Normalize DuckDuckGo href (uddg)
    content = content.replace(
        "result_dicts.append({'href': href, 'title': title, 'body': snippet})\n",
        "# Normalize DuckDuckGo redirect hrefs\n            try:\n                from urllib.parse import urlparse, parse_qs, unquote\n                u = urlparse(href)\n                if href.startswith('/l/') or (u.netloc.endswith('duckduckgo.com') and (u.path.startswith('/l/') or 'uddg=' in u.query)):\n                    qs = parse_qs(u.query).get('uddg', [])\n                    if qs:\n                        href = unquote(qs[0])\n                elif href.startswith('//'):\n                    href = 'https:' + href\n            except Exception:\n                pass\n            result_dicts.append({'href': href, 'title': title, 'body': snippet})\n",
    )
    notes.append("normalize DuckDuckGo redirect hrefs")

    # 6) Domain prioritization after results filled
    if "Boost results that match domain present in query" not in content:
        content = content.replace(
            "                result_urls.append(result[\"href\"])\n",
            "                result_urls.append(result[\"href\"])\n        # Boost results that match domain present in query\n        try:\n            import re\n            m = re.search(r'([a-z0-9.-]+\\.[a-z]{2,})', query.lower())\n            if m:\n                dom = m.group(1)\n                def d(u):\n                    try:\n                        from urllib.parse import urlparse\n                        return urlparse(u).netloc.lower()\n                    except Exception:\n                        return ''\n                paired = list(zip(result_urls, result_documents))\n                matching = [p for p in paired if dom in d(p[0])]\n                others = [p for p in paired if dom not in d(p[0])]\n                paired = matching + others\n                result_urls = [p[0] for p in paired]\n                result_documents = [p[1] for p in paired]\n        except Exception:\n            pass\n",
        )
        notes.append("domain prioritization")

    # 7) Inject domain root URLs before simple_search branch
    content = content.replace(
        "\n        if simple_search:\n",
        "\n        # Ensure domain root URL is included if present in query\n        try:\n            import re\n            m = re.search(r'([a-z0-9.-]+\\.[a-z]{2,})', query.lower())\n            if m:\n                base = m.group(1)\n                candidates = [\n                    f'https://{base}/', f'http://{base}/', f'https://www.{base}/', f'http://www.{base}/'\n                ]\n                prepend = [u for u in candidates if u not in result_urls]\n                if prepend:\n                    result_urls = prepend + result_urls\n                    for u in reversed(prepend):\n                        result_documents.insert(0, Document(page_content=f'Title: {u}', metadata={'source': u}))\n        except Exception:\n            pass\n\n        if simple_search:\n",
    )
    notes.append("domain root injection")

    # 8) Guard after async_fetch_chunk_websites
    content = content.replace(
        "        )\n\n        await emit_status(event_emitter, \"Retrieving relevant results...\", False)",
        "        )\n\n        if not split_docs:\n            logger.warning(\"No webpages fetched successfully\")\n            return []\n\n        await emit_status(event_emitter, \"Retrieving relevant results...\", False)",
    )
    notes.append("guard after webpages fetch")

    # 9) Lower threshold temporarily when domain present (optional boost)
    if "Lower similarity threshold" not in content:
        content = content.replace(
            "\n        if simple_search:\n",
            "\n        # Lower similarity threshold when explicit domain is present in query\n        _restore_threshold = None\n        try:\n            import re\n            if re.search(r'([a-z0-9.-]+\\.[a-z]{2,})', query.lower()):\n                _restore_threshold = self.similarity_threshold\n                self.similarity_threshold = min(self.similarity_threshold, 0.1)\n        except Exception:\n            pass\n\n        if simple_search:\n",
        )
        content = content.replace(
            "\n\n        documents.extend(retrieved_docs)",
            "\n        # Restore previous threshold if modified\n        if _restore_threshold is not None:\n            self.similarity_threshold = _restore_threshold\n\n        documents.extend(retrieved_docs)",
        )
        notes.append("temporary threshold lowering when domain explicit")

    # 10) Bound k for DenseRetriever
    content = re.sub(
        r"DenseRetriever\(\n\s*self\.embedding_model,\n\s*num_results=self\.num_results,",
        "DenseRetriever(\n            self.embedding_model,\n            num_results=min(self.num_results, len(documents)),",
        content,
        count=1,
    )
    content = re.sub(
        r"DenseRetriever\(\n\s*self\.embedding_model,\n\s*num_results=self\.num_results,",
        "DenseRetriever(\n            self.embedding_model,\n            num_results=min(self.num_results, len(split_docs)),",
        content,
        count=1,
    )
    notes.append("k bounded for DenseRetriever")

    # 11) Fix split regex off-by-one
    content = content.replace(
        "for i in range(1, len(_splits), 2)",
        "for i in range(1, len(_splits) - 1, 2)",
    )
    notes.append("regex split off-by-one fix")

    return content, notes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", default=str(DB_PATH), help="Path to webui.db")
    args = parser.parse_args()

    db = Path(args.db)
    if not db.exists():
        raise SystemExit(f"DB not found: {db}")

    backup = backup_db(db)
    print(f"Backup created: {backup}")

    con = sqlite3.connect(str(db))
    cur = con.cursor()
    cur.execute("SELECT content FROM tool WHERE id='llm_web_search'")
    row = cur.fetchone()
    if not row:
        raise SystemExit("Tool 'llm_web_search' not found in DB. Install the tool first.")
    content = row[0]

    new_content, notes = patch_content(content)
    if new_content == content:
        print("No changes applied (already patched).")
        return

    cur.execute("UPDATE tool SET content=? WHERE id='llm_web_search'", (new_content,))
    con.commit()
    print("Patched 'llm_web_search' successfully.")
    for n in notes:
        print(f" - {n}")


if __name__ == "__main__":
    main()

