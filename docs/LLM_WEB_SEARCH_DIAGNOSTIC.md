# LLM Web Search — Diagnostic et Plan d’exécution

Date: $(date)

## Objectif
- Reproduire l’erreur ddgs (headers) et consigner les logs.
- Localiser et corriger l’instanciation DDGS/AsyncDDGS conformément à ddgs ≥9.
- Tester les 2 chemins: ddgs (duckduckgo_only=OFF) et fallback HTML (duckduckgo_only=ON).
- Documenter précisément (procédure, patchs, rollback).

## Plan détaillé (exécution)
1) Lecture des docs locales et inventaire du code (retrieval/web, middleware, tools DB).
2) Reproduction via UI (outil activé) et capture logs `api_doc_ia.log`.
3) Localisation de l’instanciation `AsyncDDGS` du tool en base (table `tool`, id `llm_web_search`).
4) Correctif: retirer `headers=`/`proxies=` du `super().__init__` (conserver `proxy/timeout/verify`).
5) Reload propre du tool (endpoint /v1/tools/id/llm_web_search/update ou redémarrage service si nécessaire).
6) Tests: ddgs (OFF) et fallback HTML (ON); simple_search ON/OFF; vérification citations/URLs.
7) Rédaction doc finale + scripts de tests + patch unifié.

## Constat initial (résumé)
- Erreur observée (extrait):
  `DDGS.__init__() got an unexpected keyword argument 'headers'`
- Logs source: `api_doc_ia.log` (voir section Logs ci-dessous).
- Code fautif: tool « LLM Web Search » (store Open WebUI) stocké en DB (table `tool`). Classe `AsyncDDGS(DDGS)` appelle `super().__init__(headers=..., proxies=..., proxy=..., timeout=..., verify=...)` alors que ddgs ≥9 n’accepte plus `headers`/`proxies` au constructeur.

## Configuration de test (prévue)
- duckduckgo_only=OFF ; simple_search=ON ; searxng_url=None ; num_results=5 ; max_results=5.
- Modèle d’embedding: `all-MiniLM-L6-v2` (cache: `./models`).

## Logs collectés
- Extraits finaux (après correctifs et redémarrages contrôlés):
  - Loaded module tool: `tool_llm_web_search`
  - Test perdu.com:
    - Web search retrieved results; includes `https://www.perdu.com/` en tête
  - Test météo Vignacourt: résultats horaires (plusieurs sources)
  - Test prix iPhone 15: pages marchands (BestBuy, etc.)
  - Test actualité France: pages d’actualité (HuffPost France, etc.)
  - Test recette crêpes: pages recettes (Marie Claire, etc.)
  - Un avertissement ponctuel possible: `No webpages fetched successfully` (réseau/rate-limit sur certaines URLs), mais sans échec global (pipeline renvoie des résultats).

## Sauvegardes réalisées
- Export tool DB → backups/tools/llm_web_search.backup-<timestamp>.py

## Extraits de logs (reproduction)

    525:2025-09-07 11:51:53.158 | INFO     | open_webui.routers.ollama:generate_chat_completion:1291 - 🧾 ollama_payload_audit: options={"temperature": 0.7, "num_ctx": 100000, "num_predict": 4096, "num_gpu": 49, "use_mmap": true}, messages_count=1, last_message_chars=217, last_head="Peux tu rechercher ce qu’ai le site www.perdu.com , et me dire son contenu ?\n\nTool `llm_web_search/search_web` Output: The search tool encountered an error: DDGS.__init__() got an unexpected keyword a", last_tail="r ce qu’ai le site www.perdu.com , et me dire son contenu ?\n\nTool `llm_web_search/search_web` Output: The search tool encountered an error: DDGS.__init__() got an unexpected keyword argument 'headers'" - {}
    552:2025-09-07 11:52:41.712 | INFO     | open_webui.routers.ollama:generate_chat_completion:1291 - 🧾 ollama_payload_audit: options={"temperature": 0.7, "num_ctx": 100000, "num_predict": 4096, "num_gpu": 49, "use_mmap": true}, messages_count=1, last_message_chars=217, last_head="Peux tu rechercher ce qu’ai le site www.perdu.com , et me dire son contenu ?\n\nTool `llm_web_search/search_web` Output: The search tool encountered an error: DDGS.__init__() got an unexpected keyword a", last_tail="r ce qu’ai le site www.perdu.com , et me dire son contenu ?\n\nTool `llm_web_search/search_web` Output: The search tool encountered an error: DDGS.__init__() got an unexpected keyword argument 'headers'" - {}
    577:2025-09-07 11:56:13.728 | INFO     | open_webui.routers.ollama:generate_chat_completion:1291 - 🧾 ollama_payload_audit: options={"temperature": 0.7, "num_ctx": 100000, "num_predict": 4096, "num_gpu": 49, "use_mmap": true}, messages_count=1, last_message_chars=190, last_head="peux tu me dire ce qu’est le site www.perdu.com ?\n\nTool `llm_web_search/search_web` Output: The search tool encountered an error: DDGS.__init__() got an unexpected keyword argument 'headers'", last_tail="peux tu me dire ce qu’est le site www.perdu.com ?\n\nTool `llm_web_search/search_web` Output: The search tool encountered an error: DDGS.__init__() got an unexpected keyword argument 'headers'" - {}

### Extraits finaux (succès)
    ... Tool `llm_web_search/search_web` Output: Result 1:
    Vous Etes Perdu ? Perdu sur l'Internet ?
    Source URL: https://www.perdu.com/
    ...
    Vignacourt: Hourly Forecast ...
    ...
    Source URL: https://www.huffingtonpost.fr/france/
    ...
    Source URL: https://www.marieclaire.fr/cuisine/la-pate-a-crepes-de-jean-francois-piege,1488196.asp


    2025-09-07 12:2x:xx | INFO | ... Tool `llm_web_search/search_web` Output: The search tool encountered an error: DDGS.text() takes 2 positional arguments but 7 were given

Analyse rapide:
- Après retrait de `headers`/`proxies`, l’appel `AsyncDDGS.atext` du tool passait les paramètres à `super().text` en positionnel via `run_in_executor`, alors que la lib `duckduckgo_search` attend `keywords` positionnel et le reste en mots-clés (`region=`, `safesearch=`, `timelimit=`, `backend=`, `max_results=`). Correction appliquée: appel par mots‑clés (lambda) dans le thread pool.
