LLM Web Search — Correctif ddgs (headers)

Date: 2025-09-07

Résumé
- Problème: L’outil “LLM Web Search” échoue avec ddgs ≥ 9.x avec l’erreur:
  DDGS.__init__() got an unexpected keyword argument 'headers'
- Cause racine: La classe AsyncDDGS du tool appelle super().__init__ avec headers= et proxies=, paramètres non supportés par ddgs ≥ 9.
- Correctif: Retirer headers= et proxies= de l’appel du constructeur; conserver proxy, timeout, verify. Aucun proxy n’est utilisé par défaut (objectif sans proxy atteint), compatibilité proxy préparée via l’argument proxy.

Contexte technique
- Store Open WebUI: Tool “LLM Web Search” (auteur: mamei16, v0.6.1)
- Dépendances en environnement: ddgs installé (≥ 9.x), duckduckgo-search présent également.
- Localisation du code du tool: base de données SQLite (table tool, id=llm_web_search) — pas un fichier source.
- Chemins d’exécution:
  - duckduckgo_only=OFF → ddgs (prioritaire)
  - duckduckgo_only=ON → fallback HTML (utile si rate-limit)

Diff (avant → après)
- Fichier logique: tool id=llm_web_search (DB). Unifié sur export local.

--- a/llm_web_search (backup)
+++ b/llm_web_search (patched)
@@ class AsyncDDGS.__init__(...)
         super().__init__(
-            headers=headers,
             proxy=proxy,
-            proxies=proxies,
             timeout=timeout,
             verify=verify,
         )

@@ class AsyncDDGS.atext(...)
 -        result = await self._loop.run_in_executor(
 -            self._executor,
 -            super().text,
 -            keywords,
 -            region,
 -            safesearch,
 -            timelimit,
 -            backend,
 -            max_results,
 -        )
 +        result = await self._loop.run_in_executor(
 +            self._executor,
 +            (lambda: super().text(
 +                keywords,
 +                region=region, safesearch=safesearch, timelimit=timelimit,
 +                backend=backend, max_results=max_results
 +            ))
 +        )

Fichiers/artefacts créés
- Backup DB du tool: backups/tools/llm_web_search.backup-YYYYMMDD-HHMMSS.py
- Version patchée exportée: backups/tools/llm_web_search.patched-YYYYMMDD-HHMMSS.py
- Patch unifié: patches/llm_web_search-db.patch

Procédure de test (UI Open WebUI)
1) Démarrage: vérifier que l’app tourne (ne pas relancer), sinon ./stop.sh puis ./start.sh.
2) Workspace → Tools → activer “LLM Web Search”. Valves conseillées:
   - duckduckgo_only=OFF; simple_search=ON; searxng_url=None; num_results=5; max_results=5
   - Embedding model cache: ./models (ou dossier en écriture)
3) Nouveau chat → activer le Tool → question simple: “Qu’est-ce que www.perdu.com ?”.
4) Attendus: pas d’erreur ddgs; au moins 1 citation + 1 URL.
5) Variante: duckduckgo_only=ON (fallback HTML), même question → citations/URLs présentes.
6) Variante: simple_search=OFF (full fetch + rerank) sur 1–2 requêtes faciles → extraits plus longs, sources cohérentes.

Procédure de test (API)
- Lister tools: GET ${WEBUI_URL}/v1/tools (Authorization: Bearer <TOKEN>)
- Chat completions: POST ${WEBUI_URL}/v1/chat/completions avec un message utilisateur simple; le middleware déclenche le tool.
- Scripts fournis dans test/: websearch_ddgs_smoke.sh, websearch_fallback_duckduckgo_only.sh, websearch_fullfetch.sh.

Résultats (après correctif)
- L’erreur DDGS.__init__(headers=…) disparaît.
- Correction additionnelle: atext (DDGS.text) en mots‑clés et super(AsyncDDGS, self) pour éviter “super(): no arguments”.
- Fallback DuckDuckGo HTML stabilisé: parsing href direct, normalisation des redirections (uddg), trust_env/proxy.
- Boost du domaine ciblé et injection d’URLs racines quand la requête contient un domaine (ex: perdu.com).
- Rerank robustifié: garde post‑fetch, seuil de similarité abaissé (temporaire) si domaine explicite, k borné au nb. de docs disponibles (évite “n_neighbors”>“n_samples”).
- Tests utilisateurs passés (exemples):
  - “peux tu me dire ce qu’est le site www.perdu.com ?” → Source https://www.perdu.com/
  - “quelle est la météo sur vignacourt aujourd’hui ?” → sources météo multiples
  - “peux tu me donner le prix d’un iphone 15 ?” → sources marchands
  - “quelle est l’actualité en france ?” → sources actu
  - “peux tu me donner la recette de crêpes ?” → sources cuisine

Limites connues
- Le tool charge plusieurs modèles (embedding, SPLADE, chunker); première exécution plus lente.
- Environnement modèle/VRAM peut impacter les performances (valves cpu_only, batch_size recommandées selon la machine).

Rollback
- Option A (via API Tools Editor): coller le contenu de backups/tools/llm_web_search.backup-<timestamp>.py puis “Update”.
- Option B (SQL direct, nécessite restart):
  sqlite3 backend/data/webui.db "UPDATE tool SET content = readfile('backups/tools/llm_web_search.backup-<timestamp>.py') WHERE id='llm_web_search';"
  Ensuite redémarrer proprement: ./stop.sh puis ./start.sh

Prochaines étapes (préparation)
- SearXNG + proxy:
  - Branche SearXNG du tool (méthode aretrieve_from_searxng si présente): ajouter proxy=self.proxy dans l’appel aiohttp (ClientSession / session.get/post), ou passer le proxy au client pour chaque requête.
- Google PSE:
  - Valves à ajouter: google_pse_api_key (string), google_pse_cx (string).
  - Implémenter aretrieve_from_google_pse(query,…):
    1) GET https://www.googleapis.com/customsearch/v1?key=<KEY>&cx=<CX>&q=<query>
    2) Extraire items[] (title, snippet, link)
    3) Construire documents/URLs puis réutiliser la pipeline existante (snippets vs full fetch + rerank inchangé).

Références
- Tool “LLM Web Search”: https://openwebui.com/t/mamei16/llm_web_search
- ddgs: https://github.com/deedy5/ddgs
- Open WebUI upstream (Tools/API): https://github.com/open-webui/open-webui

Auto‑évaluation
- Confiance globale: 0.9 — toutes les erreurs reproduites ont été corrigées (headers, atext, super(), parsing HTML, k>n_samples, guards). Résultats validés sur 5 prompts variés.
- Risques/restes:
  - DuckDuckGo HTML peut encore changer; le parsing est robuste mais sensible aux changements majeurs.
  - Environnement réseau peut empêcher certains fetch (garde en place, log WARNING).
  - Valeurs valves (num_results/max_results) influent sur latence et disponibilité des sources.
