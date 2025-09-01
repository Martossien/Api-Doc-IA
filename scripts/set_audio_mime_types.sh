#!/usr/bin/env bash
set -euo pipefail

# Update processing.supported_mime_types via Admin API v2
# Requirements: curl, jq

HOST=${API_DOC_IA_HOST:-"http://127.0.0.1:8080"}
TOKEN=${API_DOC_IA_TOKEN:-""}
MIMES=${1:-""}

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Please install jq (apt/yum/brew)." >&2
  exit 2
fi

if [ -z "$TOKEN" ]; then
  echo "Usage: API_DOC_IA_TOKEN=... $0 \"audio/mpeg,audio/wav,audio/ogg,audio/x-m4a,audio/webm\"" >&2
  echo "Optionally set API_DOC_IA_HOST (default $HOST)." >&2
  exit 2
fi

if [ -z "$MIMES" ]; then
  echo "Please provide a comma-separated list of MIME types." >&2
  exit 2
fi

AUTH=( -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" )

get_url1="$HOST/api/configs/api_v2/admin/config"
get_url2="$HOST/configs/api_v2/admin/config"
post_url1="$HOST/api/configs/api_v2/admin/config"
post_url2="$HOST/configs/api_v2/admin/config"

echo "Fetching current admin config from $get_url1 ..."
set +e
CFG=$(curl -sfSL "${get_url1}" "${AUTH[@]}")
RC=$?
set -e
if [ $RC -ne 0 ] || [ -z "$CFG" ]; then
  echo "Fallback: fetching from $get_url2 ..."
  CFG=$(curl -sfSL "${get_url2}" "${AUTH[@]}")
fi

# Prepare new config JSON with updated supported_mime_types
MIME_ARRAY=$(printf '%s' "$MIMES" | awk -F',' '{for(i=1;i<=NF;i++){gsub(/^\s+|\s+$/, "", $i); if($i!="") printf "\"%s\"%s", $i, (i<NF?",":"")}}')

UPDATED=$(jq --argjson arr "[${MIME_ARRAY}]" \
  '.processing.supported_mime_types = $arr' <<<"$CFG")

PAYLOAD=$(jq -n --argjson cfg "$UPDATED" '{config: $cfg, backup_current: true, reason: "Update supported_mime_types via script"}')

echo "Posting updated config to $post_url1 ..."
set +e
RESP=$(curl -sfSL -X POST "${post_url1}" "${AUTH[@]}" -d "$PAYLOAD")
RC=$?
set -e
if [ $RC -ne 0 ] || [ -z "$RESP" ]; then
  echo "Fallback: posting to $post_url2 ..."
  RESP=$(curl -sfSL -X POST "${post_url2}" "${AUTH[@]}" -d "$PAYLOAD")
fi

echo "$RESP" | jq '.processing.supported_mime_types'
echo "Done."

