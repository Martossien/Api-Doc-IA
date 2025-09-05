#!/usr/bin/env python3
import argparse
import asyncio
import hashlib
import json
import os
import sys
from datetime import datetime

from aiohttp import web, ClientSession, ClientTimeout


async def handle_any(request: web.Request):
    target_base: str = request.app['target']
    save_dir: str = request.app['save_dir']

    # Build target URL
    path_qs = request.rel_url.raw_path_qs
    target_url = target_base.rstrip('/') + path_qs

    method = request.method.upper()
    headers = dict(request.headers)

    # Read body (may be empty for GET)
    body = await request.read()

    # Prepare forensic record
    ts = datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    rec = {
        'ts': ts,
        'method': method,
        'path_qs': path_qs,
        'headers': headers,
        'bytes': len(body),
        'sha256': hashlib.sha256(body).hexdigest(),
    }
    # Try parse JSON for head/tail of messages
    ctx_head = ctx_tail = None
    try:
        if body:
            data = json.loads(body.decode('utf-8', errors='ignore'))
            msgs = data.get('messages') or []
            last = msgs[-1] if isinstance(msgs, list) and msgs else {}
            content = last.get('content') if isinstance(last, dict) else None
            if isinstance(content, str):
                ctx_head = content[:200]
                ctx_tail = content[-200:] if len(content) > 200 else content
    except Exception:
        pass
    rec['last_message_head'] = ctx_head
    rec['last_message_tail'] = ctx_tail

    # Ensure save dir
    os.makedirs(save_dir, exist_ok=True)
    # Save raw payload to file for exact proof
    raw_path = os.path.join(save_dir, f"req-{ts}.json")
    with open(raw_path, 'wb') as f:
        f.write(body)
    # Save metadata
    meta_path = os.path.join(save_dir, f"req-{ts}.meta.json")
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(rec, f, ensure_ascii=False, indent=2)

    print(f"[TEE] {method} {path_qs} bytes={rec['bytes']} sha256={rec['sha256']} saved={os.path.basename(raw_path)}")
    if ctx_head is not None:
        print(f"[TEE] head={ctx_head!r}")
        print(f"[TEE] tail={ctx_tail!r}")

    timeout = ClientTimeout(total=600)
    async with ClientSession(timeout=timeout, trust_env=True) as session:
        async with session.request(method, target_url, data=body, headers=headers) as resp:
            # Relay status, headers and body
            out_headers = dict(resp.headers)
            # Remove hop-by-hop headers that aiohttp may not like duplicated
            out_headers.pop('Transfer-Encoding', None)
            out_headers.pop('Content-Length', None)
            data = await resp.read()
            return web.Response(status=resp.status, headers=out_headers, body=data)


def main():
    parser = argparse.ArgumentParser(description='Ollama tee proxy with payload capture')
    parser.add_argument('--listen', default='127.0.0.1:11435', help='listen host:port (default 127.0.0.1:11435)')
    parser.add_argument('--target', default='http://127.0.0.1:11434', help='target Ollama base URL')
    parser.add_argument('--out', default='out/ollama_proxy', help='directory to save captured payloads')
    args = parser.parse_args()

    host, port = args.listen.split(':')
    app = web.Application()
    app['target'] = args.target
    app['save_dir'] = args.out
    # Route all paths to handler
    app.router.add_route('*', '/{tail:.*}', handle_any)

    print(f"[TEE] Listening on http://{host}:{port} forwarding to {args.target}")
    web.run_app(app, host=host, port=int(port))


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)

