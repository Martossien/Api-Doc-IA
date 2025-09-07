#!/usr/bin/env bash
set -euo pipefail

# Minimal smoke test for LLM Web Search using ddgs path
# Requirements:
# - WEBUI_URL (default http://localhost:8080)
# - TOKEN (JWT with access)

WEBUI_URL=${WEBUI_URL:-"http://localhost:8080"}
TOKEN=${TOKEN:-""}

if [ -z "$TOKEN" ]; then
  echo "ERROR: TOKEN env var is required" >&2
  exit 1
fi

echo "[1/3] Listing tools..."
curl -fsS -H "Authorization: Bearer ${TOKEN}" \
  "${WEBUI_URL}/v1/tools" >/dev/null

echo "[2/3] Sending chat completion with web search intent..."
BODY='{
  "model": "llama3:8b",
  "messages": [
    {"role": "user", "content": "Qu\u2019est-ce que www.perdu.com ? Fais une recherche web et cite tes sources."}
  ],
  "stream": false
}'

RESP=$(curl -fsS -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" \
  -d "$BODY" "${WEBUI_URL}/v1/chat/completions")

echo "$RESP" | grep -Eo 'https?://[^\" ]+' | head -n 1 >/dev/null || {
  echo "ERROR: No URL detected in response" >&2
  exit 2
}

echo "OK: at least one URL detected in the response."

