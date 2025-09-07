#!/usr/bin/env bash
set -euo pipefail

# Smoke test using fallback DuckDuckGo HTML path (duckduckgo_only=ON)
# Pre-req: Set the tool valves duckduckgo_only=true in UI or via API before running.

WEBUI_URL=${WEBUI_URL:-"http://localhost:8080"}
TOKEN=${TOKEN:-""}

if [ -z "$TOKEN" ]; then
  echo "ERROR: TOKEN env var is required" >&2
  exit 1
fi

echo "[1/2] Sending chat completion with fallback HTML expected..."
BODY='{
  "model": "llama3:8b",
  "messages": [
    {"role": "user", "content": "Qu\u2019est-ce que www.perdu.com ? Utilise le fallback DuckDuckGo si besoin et cite tes sources."}
  ],
  "stream": false
}'

RESP=$(curl -fsS -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" \
  -d "$BODY" "${WEBUI_URL}/v1/chat/completions")

echo "$RESP" | grep -Eo 'https?://[^\" ]+' | head -n 1 >/dev/null || {
  echo "ERROR: No URL detected in response (fallback)" >&2
  exit 2
}

echo "OK: at least one URL detected (fallback)."

