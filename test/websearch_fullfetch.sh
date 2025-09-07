#!/usr/bin/env bash
set -euo pipefail

# Optional test: simple_search=OFF (full fetch + rerank)
# Pre-req: Set the tool valves simple_search=false in UI or via API before running.

WEBUI_URL=${WEBUI_URL:-"http://localhost:8080"}
TOKEN=${TOKEN:-""}

if [ -z "$TOKEN" ]; then
  echo "ERROR: TOKEN env var is required" >&2
  exit 1
fi

BODY='{
  "model": "llama3:8b",
  "messages": [
    {"role": "user", "content": "Donne-moi une brève description de www.perdu.com avec des citations web."}
  ],
  "stream": false
}'

RESP=$(curl -fsS -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" \
  -d "$BODY" "${WEBUI_URL}/v1/chat/completions")

# Heuristique: on s'attend à > 200 caractères et au moins 1 URL
LEN=$(echo -n "$RESP" | wc -c)
echo "$RESP" | grep -Eo 'https?://[^\" ]+' | head -n 1 >/dev/null || {
  echo "ERROR: No URL detected in response (fullfetch)" >&2
  exit 2
}

test "$LEN" -ge 200 || {
  echo "WARNING: Response shorter than expected ($LEN bytes)." >&2
}

echo "OK: response contains at least one URL (full fetch)."

