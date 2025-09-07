.PHONY: test smoke

WEBUI_URL ?= http://localhost:8080
TOKEN ?=

smoke: test/websearch_ddgs_smoke.sh
	WEBUI_URL=$(WEBUI_URL) TOKEN=$(TOKEN) bash test/websearch_ddgs_smoke.sh

fallback: test/websearch_fallback_duckduckgo_only.sh
	WEBUI_URL=$(WEBUI_URL) TOKEN=$(TOKEN) bash test/websearch_fallback_duckduckgo_only.sh

fullfetch: test/websearch_fullfetch.sh
	WEBUI_URL=$(WEBUI_URL) TOKEN=$(TOKEN) bash test/websearch_fullfetch.sh

test: smoke

