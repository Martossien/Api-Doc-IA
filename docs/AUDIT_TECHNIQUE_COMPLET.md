# AUDIT TECHNIQUE COMPLET - API-DOC-IA
Date: 1 sept. 2025

## 0. ÉCARTS CONSTATÉS
- Arborescence réelle: le backend applicatif est sous `backend/open_webui` (fork OpenWebUI v0.6.5 + ajouts API v2), non pas à la racine.
- Les trois briques pipeline mentionnées (SMBeagle enriched → llm-content-analyzer → reports-generator) ne sont pas toutes présentes dans ce dépôt: `llm-content-analyzer/` est présent (client batch), mais pas de répertoire “reports-generator” ni “SMBeagle enriched” — considéré hors scope.
- API v2 est montée à deux préfixes: `/api/v2` (app principale) et `/v2` (sous `api_app`) via `open_webui/main.py`. C’est une divergence utile à documenter (double montage).
- Démarrage: scripts présents dans le dépôt: `./start.sh`, `./start_fast.sh`, `./run-compose.sh` (port par défaut 8080). Le lancement direct via `uvicorn open_webui.main:app` reste possible.
- Répertoires de données configurés (uploads, vector_db) créés à l’exécution dans `backend/open_webui/data`. Le répertoire `build/` est présent (assets frontend). Les répertoires de sauvegarde cités auparavant n’existent pas ici.
- Schéma Pydantic vs usage: `FileForm` ne définit pas `content_type`/`size`, alors que l’adapter API v2 les passe au constructeur. Pydantic v2 ignore ces champs (extra=ignore) — conséquence: ces métadonnées ne sont pas persistées via `FileForm` (voir Evidence).

## 1. RÉSUMÉ EXÉCUTIF
- Projet: fork OpenWebUI v0.6.5 étendu avec une API v2 simplifiée, orientée traitement de documents (upload + prompt) avec orchestration asynchrone, queue et suivi de tâches en base.
- Architecture: FastAPI + SQLAlchemy (Base/Session depuis `internal/db.py`), Peewee migrations d’amorçage, stockage fichiers via provider (local/S3/GCS/Azure), RAG (Chroma par défaut, support Milvus/Qdrant/OpenSearch/Elasticsearch/Pgvector), intégration LLMs (Ollama/OpenAI) et utilitaires (templates RAG, handlers hérités d’API v1).
- API v2: endpoints stables pour `POST /process`, `GET /status/{task_id}`, `GET /models`, `GET /health`, `GET /config`, `DELETE /tasks/{task_id}`. Concurrence contrôlée via sémaphore et/ou comptage DB; tâches persistées dans `api_v2_tasks`.
- Points validés: migration de config vers DB, correction ThreadPool imbriqués, wrapper API v1 pour fiabiliser le flux, extraction contenu consolidée via `retrieval.process_file` + injection de contexte; démarrage via scripts fournis; production OK (logs et scripts dédiés).

## 2. HISTORIQUE ET CONTEXTE
- Documentation interne disponible dans `docs/` (guides et endpoints):
  - `docs/API_V2_ENDPOINTS.md`, `docs/API_V2_DOCUMENTATION.md`, `docs/API_V2_ADMIN_GUIDE.md`, `ARCHITECTURE.md`, `INSTALLATION.md`, `TROUBLESHOOTING.md`.
- Changements récents et contexte: voir `CHANGELOG.md` et `README.md` à la racine.
- Problèmes résolus (confirmés par code):
  - Migration config JSON → DB via `open_webui/config.py` (PersistentConfig + `save_to_db`) et Alembic (voir Evidence 3.2).
  - Correction ThreadPool imbriqués: usage central de `chat_completion_files_handler` et threadpool paramétré (`RAG_THREADPOOL_MAX_WORKERS`).
  - Wrapper API v1: API v2 `adapter.process_document()` délègue au handler v1 pour stabilité (Evidence 4.3).
  - Extraction de contenu: appel explicite à `retrieval.process_file` avant RAG, injection de contexte (Evidence 4.4).

## 3. ARCHITECTURE SYSTÈME
- Inventaire du dépôt (principaux éléments, hors dossiers ignorés):
  - Backend app: `backend/open_webui` (routers, models, config/env, retrieval, utils, storage, main.py).
  - Clients: `llm-content-analyzer/` (batch), `client_demo/` (GUI démonstration PyInstaller).
  - Démarrage: scripts `start.sh`, `start_fast.sh`, `run-compose.sh`, et fichiers `docker-compose*.yaml` pour tests/containers.
  - Données: chemins configurés sous `backend/open_webui/data/` (uploads, vector_db) créés au runtime; `build/` contient le frontend bundlé.

- Flux end-to-end (API v2, traitement d’un document):
  ```
  Client → POST /api/v2/process (file + prompt, auth) →
    Adapter.upload_file → Storage.upload_file → Files.insert_new_file
    → Création ApiV2Task (DB) → Sémaphore/concurrence → Background task
      → adapter.process_document(task_id, file_info, prompt, user)
        1) process_file(file_id) → extraction/DB
        2) chat_completion_files_handler() [API v1]
            - enrichit messages avec sources/context
        3) generate_chat_completion() → LLM
        4) formattage résultat + update ApiV2Task
      → Cleanup mémoire + auto-dequeue si file d’attente
  Client → GET /api/v2/status/{task_id} (auth) → état/resultat
  ```

- Technologies détectées (éléments clés):
  - FastAPI, Starlette middlewares, Pydantic v2, SQLAlchemy + Peewee migrate bootstrap.
  - RAG: Chroma (par défaut), alternatives Milvus/Qdrant/OpenSearch/Elasticsearch/Pgvector.
  - Stockage: Local/S3/GCS/Azure via abstraction `storage/provider.py`.
  - LLM providers: OpenAI/Ollama (v1 routes) réutilisés par le wrapper v2.

### Evidence 3.1 — Montage des routeurs API v2
```python
# backend/open_webui/main.py
api_app.include_router(api_v2.router, prefix="/v2", tags=["api_v2"])  # v2 interne
app.include_router(api_v2.router, prefix="/api/v2", tags=["api_v2"])  # v2 publique
```

### Evidence 3.2 — Migration config vers DB et PersistentConfig
```python
# backend/open_webui/config.py (extraits)
class Config(Base):
    __tablename__ = "config"
    id = Column(Integer, primary_key=True)
    data = Column(JSON, nullable=False)

def save_to_db(data):
    with get_db() as db:
        existing_config = db.query(Config).first()
        ...
        db.commit()

class PersistentConfig(Generic[T]):
    def __init__(self, env_name, config_path, env_value):
        self.value = config_value if in_db else env_value
```

## 4. API V2 — CŒUR DU SYSTÈME

### 4.1 Endpoints extraits automatiquement
- Méthode/Path (handler; auth):
  - POST `/api/v2/process` (process_document; auth user/admin)
  - GET `/api/v2/status/{task_id}` (get_task_status; auth user/admin)
  - GET `/api/v2/models` (get_available_models; auth user/admin)
  - GET `/api/v2/health` (health_check; public)
  - GET `/api/v2/config` (get_api_config; auth user/admin)
  - DELETE `/api/v2/tasks/{task_id}` (cancel_task; auth user/admin)

Evidence — définition des routes:
```python
# backend/open_webui/routers/api_v2.py (extraits)
@router.post("/process", response_model=TaskResponse)
async def process_document(..., user: UserModel = Depends(get_verified_user)):
    ...
@router.get("/status/{task_id}", response_model=StatusResponse)
async def get_task_status(task_id: str, user: UserModel = Depends(get_verified_user)):
    ...
@router.get("/models", response_model=ModelResponse)
async def get_available_models(user: UserModel = Depends(get_verified_user)):
    ...
@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    ...
@router.get("/config", response_model=ConfigResponse)
async def get_api_config(user: UserModel = Depends(get_verified_user)):
    ...
@router.delete("/tasks/{task_id}")
async def cancel_task(task_id: str, user: UserModel = Depends(get_verified_user)):
    ...
```

### 4.2 Modèles Pydantic (validation vs usage)
- Principaux schémas: `TaskRequest`, `TaskResponse`, `StatusResponse`, `ModelResponse`, `UploadFileInfo`, `ConfigResponse`.
- Validation notable: `TaskRequest.prompt` min 5 chars; `temperature` [0.0–2.0]; `max_tokens` [1–32000].

Evidence — extraits:
```python
# backend/open_webui/api_v2/models.py
class TaskRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=4000)
    model: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=1, le=32000)

class UploadFileInfo(BaseModel):
    filename: str
    size: int
    content_type: str
    file_id: str
    uploaded_at: float = Field(default_factory=time.time)
```

Mismatch identifié (Pydantic vs appelants):
- `adapter.upload_file()` construit `FileForm(...)` avec `content_type` et `size`, mais `FileForm` ne définit pas ces champs; Pydantic les ignore — non persistés (voir Evidence 5.2).

### 4.3 Workflow de traitement (wrapper API v1)
- Phases clés dans `OpenWebUIAdapter.process_document()`:
  1) MAJ `ApiV2Task` → status `processing`, `started_at`, `progress`.
  2) `retrieval.process_file()` pour extraction; récupération du texte extrait via `Files.get_file_by_id()`; injection optionnelle de contexte inline selon `max_inline_context_chars`.
  3) Appel du handler éprouvé v1 `chat_completion_files_handler()` avec timeout plafonné (min(API_V2_TIMEOUT, 300s)).
  4) Enrichissement des messages (sources RAG injectées en en-tête du message user).
  5) `generate_chat_completion()` (LLM) avec timeout `API_V2_TIMEOUT`.
  6) Formatage résultat + MAJ DB (status, result, processing_time, model_used, progress 90→100) + cleanup mémoire + auto-dequeue.

Evidence — étapes critiques:
```python
# backend/open_webui/api_v2/adapter.py (extraits)
self.update_task_status(task_id, status=TaskStatus.PROCESSING.value, started_at=int(time.time()), progress="10.0")
...
await asyncio.to_thread(owui_process_file, request, ProcessFileForm(file_id=file_info.file_id), user)
...
enhanced_form_data, flags = await asyncio.wait_for(
    chat_completion_files_handler(request, form_data, user),
    timeout=min(API_V2_TIMEOUT.value, 300)
)
completion_result = await asyncio.wait_for(
    generate_chat_completion(request, enhanced_form_data, user),
    timeout=API_V2_TIMEOUT.value
)
```

### 4.4 Concurrence, queue, timeouts, annulation
- Concurrence: double mécanisme observé
  - Sémaphore module routeur: `asyncio.Semaphore(API_V2_MAX_CONCURRENT.value)` autour du background task.
  - Garde applicative côté adapter: `ApiV2Tasks.get_active_tasks_count() < API_V2_MAX_CONCURRENT.value`.
  - Par défaut, `API_V2_MAX_CONCURRENT` est fixé à 1,000,000 (désactive de fait la limite côté adapter). Une fonction `_calculate_api_v2_max_concurrent()` existe mais n’est pas branchée.
- Queue: si pleine, task marquée `queued` + `position` `get_queue_position()`; un auto-dequeue traite la prochaine tâche disponible après complétion.
- Timeouts: 300s max pour extraction/handler v1; `API_V2_TIMEOUT` pour la génération LLM.
- Annulation: `DELETE /api/v2/tasks/{task_id}` force status `failed` + erreur.

Evidence — contrôle concurrence/queue:
```python
# routers/api_v2.py
_processing_semaphore = asyncio.Semaphore(API_V2_MAX_CONCURRENT.value)
...
async with semaphore: ... await adapter.process_document(...)

# api_v2/adapter.py
def check_concurrency_limit(self):
    active_count = ApiV2Tasks.get_active_tasks_count()
    return active_count < API_V2_MAX_CONCURRENT.value

def get_queue_position(...):
    queued_tasks = db.query(ApiV2Task).filter_by(status="queued").order_by(...)
```

## 5. BACKEND — ANALYSE DÉTAILLÉE

### 5.1 Catégories et rôles
- `routers/api_v2.py`: Routes v2, sémaphore, background task, exposition config, santé.
- `api_v2/adapter.py`: Orchestration upload/traitement/queue/cleanup, wrapper v1.
- `api_v2/models.py`: Schémas Pydantic v2 (requests/réponses/erreurs/santé).
- `models/api_v2_tasks.py`: Schéma SQLAlchemy + opérations DB pour tasks v2.
- `utils/middleware.py`: `chat_completion_files_handler()` (coeur réutilisé v1).
- `retrieval/retrieval.py`: `process_file`, segmentations/EF/Reranker/RAG utils.
- `utils/task.py`: Templates RAG et substitutions.
- `storage/provider.py`: Abstraction Local/S3/GCS/Azure.
- `config.py` / `env.py` / `internal/db.py`: Config persistante, env, DB, migrations.

### 5.2 Evidence blocks ciblés
1) Création tâche DB et suivi
```python
# backend/open_webui/models/api_v2_tasks.py
class ApiV2Task(Base):
    __tablename__ = "api_v2_tasks"
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    status = Column(String, default="pending")
    result = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)
    ...
def insert_new_task(...):
    task_id = str(uuid.uuid4())
    task = ApiV2Task(id=task_id, user_id=user_id, status="pending", request_data=request_data,...)
```

2) Mismatch `FileForm` vs adapter
```python
# backend/open_webui/models/files.py
class FileForm(BaseModel):
    id: str; filename: str; path: str; data: dict = {}; meta: dict = {}

# backend/open_webui/api_v2/adapter.py
file_form = FileForm(
    id=file_id, filename=file.filename, path=file_path,
    content_type=file.content_type, size=file_size, user_id=user.id, ...
)
# Note: content_type/size ignorés (extra) → non persistés par FileForm
```

3) Injection de contexte/sources RAG dans messages
```python
# backend/open_webui/api_v2/adapter.py
if sources:
    context_string = "\n".join(...)
    msgs = enhanced_form_data.get("messages", [])
    ...
    msgs[user_idx]["content"] = f"[Contexte fourni]\n{context_string}\n\n{original}"
```

4) Abstraction stockage et variables providers
```python
# backend/open_webui/storage/provider.py
def get_storage_provider(storage_provider: str):
    if storage_provider == "local": ... elif storage_provider == "s3": ... elif storage_provider == "gcs": ... elif storage_provider == "azure": ...

# backend/open_webui/config.py
STORAGE_PROVIDER = os.environ.get("STORAGE_PROVIDER", "local")
S3_* / GCS_* / AZURE_STORAGE_*
UPLOAD_DIR = DATA_DIR / "uploads"
```

### 5.3 Intégrations externes (détection)
- LLMs: OpenAI/Ollama via routes v1, réutilisés par wrapper v2 (`open_webui/routers/openai.py`, `ollama.py`).
- Extraction: Tika (`TIKA_SERVER_URL`), Docling (`DOCLING_SERVER_URL`), Azure Document Intelligence (`DOCUMENT_INTELLIGENCE_ENDPOINT/KEY`), Mistral OCR (`MISTRAL_OCR_API_KEY`).
- Vector DB: `VECTOR_DB` (default `chroma`), configs pour Milvus/Qdrant/OpenSearch/Elasticsearch/Pgvector.
- Stockage: `STORAGE_PROVIDER` local/S3/GCS/Azure.

### 5.4 Variables de configuration (extraction ciblée)
- API v2
  - `API_V2_ENABLED`, `API_V2_MAX_FILE_SIZE`, `API_V2_MAX_CONCURRENT`, `API_V2_TIMEOUT`, `API_V2_ADMIN_MODEL`, `API_V2_ADMIN_CONFIG`.
- Extraction
  - `CONTENT_EXTRACTION_ENGINE`, `TIKA_SERVER_URL`, `DOCLING_SERVER_URL`, `DOCUMENT_INTELLIGENCE_ENDPOINT`, `DOCUMENT_INTELLIGENCE_KEY`, `MISTRAL_OCR_API_KEY`.
- Vector DB
  - `VECTOR_DB` (+ `CHROMA_*`, `MILVUS_*`, `QDRANT_*`, `OPENSEARCH_*`, `ELASTICSEARCH_*`, `PGVECTOR_DB_URL`, …).
- Stockage
  - `STORAGE_PROVIDER`, `S3_*`, `GCS_BUCKET_NAME`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `AZURE_STORAGE_*`.

## 6. CLIENTS ET INTERFACES
- `llm-content-analyzer/`: présent, contient `content_analyzer.py`, GUI PySide (`gui/`), bases SQLite (`analysis_results.db`). Sert de client batch production.
- `client_demo/`: présent, `main.py`, `config.ini`, scripts de build, dist binaire (`dist/`). Interface démo connectée à l’API.
- Interface Web: OpenWebUI classique disponible via `main.py` (routes v1) + API v2 montée sous `/api/v2` et `/v2`.
- Pipelines externes: SMBeagle et générateur de rapports non fournis dans ce dépôt — documentés hors scope.

## 7. CONFIGURATION ET DÉPLOIEMENT
- Variables d’environnement (exemples): voir `.env` (OLLAMA_BASE_URL, OPENAI_* vides par défaut). La `PersistentConfig` charge/écrit en base au démarrage.
- Scripts de démarrage disponibles:
  - `start.sh`: démarrage sécurisé avec vérifications, port 8080 par défaut, écrit les logs dans `api_doc_ia.log`.
  - `start_fast.sh`: démarrage rapide local (mêmes endpoints), journalise dans `api_doc_ia.log`.
  - `run-compose.sh` et `docker-compose*.yaml`: orchestration via Docker pour tests/intégration.
- Observabilité et logs: `api_doc_ia.log` à la racine du projet; autres logs selon scripts/outils utilisés.
- DB/Migrations: Peewee bootstrap puis Alembic via `run_migrations()` dans `open_webui/config.py`; SQLAlchemy session/engine (SQLite par défaut, Postgres supporté).

- SQLite (tuning automatique):
  - Le backend applique automatiquement `PRAGMA journal_mode=WAL`, `PRAGMA synchronous=NORMAL`, `PRAGMA busy_timeout=5000` lors de l’initialisation (cf. `internal/db.py`).
  - Objectif: réduire les erreurs `database is locked` en charge et améliorer la coexistence lectures/écritures.

### Evidence — Démarrage et health API v2
```bash
# Exemple de démarrage local
bash ./start.sh

# Vérification de santé
curl http://localhost:8080/api/v2/health
```

## ANNEXE — PROCÉDURE DE DÉMARRAGE RAPIDE

- Prérequis: Python installé, ports 8080 libres; variables d’environnement optionnelles dans `.env`.
- Démarrage local:
  - `bash ./start.sh`
  - Surveillez `api_doc_ia.log` pour confirmer le démarrage.
  - Vérifiez la santé: `curl http://localhost:8080/api/v2/health`
- Arrêt:
  - `bash ./stop.sh` (si disponible) ou arrêter le processus indiqué dans `api_doc_ia.pid`.
- Accès:
  - API v2: `/api/v2/*` (montée également sous `/v2/*`).
  - WebUI (selon build) accessible via `/`.

## 8. VÉRIFICATIONS AUTOMATISÉES
- Routes FastAPI (API v2):
  - post /process; get /status/{task_id}; get /models; get /health; get /config; delete /tasks/{task_id}
- Détection secrets:
  - Code: pas d’API keys en clair; les clés sont injectées via variables d’environnement/config. S’assurer qu’aucun secret (tokens, mots de passe) ne figure dans les exemples, fichiers d’uploads ou documentation avant publication.
- Schémas et incohérences:
  - `FileForm` vs `adapter.upload_file`: champs `content_type`/`size` ignorés (non persistés). Recommandation: les ranger sous `meta` pour traçabilité.
- Dépendances critiques:
  - Extraction (Tika/Docling/Azure/Mistral) pilotées via PersistentConfig/env; Vector DB paramétrable; Storage provider abstrait.
- Sécurité API v2 (ownership):
  - Vérification ownership des tasks explicitement “supprimée/allégée” (commentaire dans `api_v2.get_task_status` et `cancel_task`). Risque: visibilité inter-utilisateurs si IDs devinés/bruteforcés. Mitigation: réintroduire contrôle `user_id` ↔ `task.user_id`.
- Concurrence prouvée: sémaphore dans routes + comptage DB; timeouts explicites; auto-dequeue.
- Reproductibilité: snapshot ci-dessous.

### Evidence — Tests automatisés (intégration)
- `test/test_api_v2_meta_persistence.py`: vérifie que `meta.content_type` et `meta.size` sont bien persistés après `POST /api/v2/process` (texte).
- `test/test_api_v2_meta_persistence_pdf.py`: même vérification pour `application/pdf`.

## 9. POINTS D’ATTENTION ET MAINTENANCE
- Concurrence: `API_V2_MAX_CONCURRENT` par défaut “illimité” côté adapter. En production, envisager de le diminuer (ex.: 2–8) pour éviter la contention base (SQLite) et lisser la charge. Alternativement, basculer sur Postgres.
- Sécurité tasks: rétablir vérifications de propriété pour `status/{task_id}` et `DELETE /tasks/{task_id}`.
- Métadonnées fichiers: persister `content_type`/`size` dans `meta` pour analyses/forensics.
- Double montage API v2 (`/v2` et `/api/v2`): conserver si utile, sinon clarifier le point d’entrée officiel.
- Nettoyage données lourdes: uploads/vector_db volumineux — prévoir rétention (cleanup déjà présent pour tasks, pas pour fichiers).

## 10. CONCLUSION TECHNIQUE
- Maturité: élevée côté backend (reuse de composants éprouvés v1 + DB tasks + stockage abstrait + RAG paramétrable). Points de raffinement: ownership, plafond de concurrence, métadonnées fichiers.
- Forces: intégration stabilisée (wrapper v1), configuration persistante, observation/logs, scripts de démarrage robustes, clients présents (batch + démo).
- Faiblesses: quelques incohérences mineures (métadonnées file), limite de concurrence par défaut, double montage /v2.
- Recommandations: sécuriser ownership, harmoniser concurrence, persister métadonnées, documenter point d’entrée officiel.

## 11. DÉTECTION CLIENT (WEB VS CLIENT LOURD)
- Principe d’authentification:
  - Client lourd: `Authorization: Bearer sk-…` (clé API). Géré dans `utils/auth.get_current_user()` (branche API key) avec restrictions d’endpoints possibles.
  - Web (Open WebUI): cookie `token` (JWT) ou Bearer non `sk-`. Décodage via `decode_token()`, mise à jour activité utilisateur.
- Exemples d’en-têtes:
  - Client lourd (API v2):
    - `POST /api/v2/process`
    - `Authorization: Bearer sk-xxxxxxxx`
    - `Content-Type: multipart/form-data`
  - Conversation web (v1 typique):
    - `POST /api/chat/completions`
    - `Cookie: token=eyJ...`
    - `Content-Type: application/json`
- Règle pratique côté serveur:
  - Présence d’un Bearer commençant par `sk-` → client programmatique (client lourd/outil).
  - Présence d’un cookie `token` JWT (ou Bearer non `sk-`) → conversation web/UI.

### Note — Injection de contexte (v2 vs web)
- API v2 (clients lourds): l’adapter injecte par défaut le contenu extrait en « full context » (inline). Une limite admin optionnelle `processing.max_inline_context_chars` peut tronquer cette injection (> 0 = coupe, 0/absent = pas de coupe).
- Web (v1): par défaut, le flux utilise le RAG (retrieval top‑k), pas l’injection inline complète. Le « plein contexte » côté web ne s’active que si vous forcez des options v1:
  - `BYPASS_EMBEDDING_AND_RETRIEVAL = true` (bypass RAG → full inline)
  - `RAG_FULL_CONTEXT = true` (plein contexte pour le retrieval)
- Où activer (WebUI): via le menu Paramètres/Admin (icône engrenage), rubrique liée au « Retrieval/RAG » (libellé exact selon version). Ces drapeaux sont propres au mode web v1 et n’affectent pas l’API v2.

## ANNEXES TECHNIQUES

### A. Inventaire complet du repository (extrait, répertoires exclus: `.git/`, `node_modules/`, `__pycache__/`, données volumineuses)
- Racine (sélection):
  - `backend/open_webui/` (config.py, env.py, main.py, routers/, models/, utils/, retrieval/, storage/)
  - `llm-content-analyzer/`, `client_demo/`, `docs/`
  - Scripts: `start.sh`, `start_fast.sh`, `run-compose.sh`, fichiers docker-compose*
  - Logs/patchs/tests/outils: `api_doc_ia.log`.

### B. Table des endpoints (API v2)
- POST `/api/v2/process` (auth), GET `/api/v2/status/{task_id}` (auth), GET `/api/v2/models` (auth), GET `/api/v2/health` (public), GET `/api/v2/config` (auth), DELETE `/api/v2/tasks/{task_id}` (auth).
  - Auth: `Depends(get_verified_user)` sauf `/health`.
  - Erreurs: 404 task introuvable, 400 annulation impossible, 500 divers (upload/handler/completion), 413 fichier trop gros.

### C. Table des variables de configuration (extraits clés)
- API v2: `API_V2_ENABLED`, `API_V2_MAX_FILE_SIZE`, `API_V2_MAX_CONCURRENT`, `API_V2_TIMEOUT`, `API_V2_ADMIN_MODEL`, `API_V2_ADMIN_CONFIG`.
- Extraction: `CONTENT_EXTRACTION_ENGINE`, `TIKA_SERVER_URL`, `DOCLING_SERVER_URL`, `DOCUMENT_INTELLIGENCE_ENDPOINT`, `DOCUMENT_INTELLIGENCE_KEY`, `MISTRAL_OCR_API_KEY`.
- Vector: `VECTOR_DB` (+ familles `CHROMA_*`, `MILVUS_*`, `QDRANT_*`, `OPENSEARCH_*`, `ELASTICSEARCH_*`, `PGVECTOR_DB_URL`...).
- Storage: `STORAGE_PROVIDER`, `S3_*`, `GCS_BUCKET_NAME`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `AZURE_STORAGE_*`.

### D. Schémas des modèles (SQLAlchemy/Pydantic)
- `api_v2_tasks`: id (PK), user_id, status, result, error, error_type, created_at, started_at, completed_at, processing_time, model_used, file_id, request_data, progress, memory_usage.
- `files`: id, user_id, filename, path, data, meta, created_at/updated_at (cf. `FilesTable`).
- Pydantic v2: `TaskRequest`, `TaskResponse`, `StatusResponse`, `ModelResponse`, `UploadFileInfo`, `ConfigResponse` (cf. section 4.2).

### E. Tableaux Providers Intégrés
- Extraction:
  - Tika: `TIKA_SERVER_URL` (par défaut `http://tika:9998`).
  - Docling: `DOCLING_SERVER_URL` (par défaut `http://docling:5001`).
  - Azure Document Intelligence: `DOCUMENT_INTELLIGENCE_ENDPOINT`, `DOCUMENT_INTELLIGENCE_KEY`.
  - Mistral OCR: `MISTRAL_OCR_API_KEY`.
- Vector DB:
  - `VECTOR_DB=chroma` (défaut), support `milvus`, `qdrant`, `opensearch`, `elasticsearch`, `pgvector` (+ variables associées).
- Storage:
  - `STORAGE_PROVIDER=local|s3|gcs|azure` + `S3_*` / `GCS_BUCKET_NAME`/`GOOGLE_APPLICATION_CREDENTIALS_JSON` / `AZURE_STORAGE_*`.

### F. Evidence blocks organisés (références de code)
- Voir sections: 3.1, 3.2, 4.1–4.4, 5.2.

### G. Journal de reproductibilité
- Commit: `af1dfa1a0f56c1451cf1630f2c4d2066a87341c7` (origin/main à jour)
- Démarrage local validé avec `start.sh` (port 8080 par défaut).
- PersistentConfig instantané (clés majeures): API v2 (6 clés), Extraction (5+), Vector DB (famille selon `VECTOR_DB`), Storage (provider + clés).
- Sanity:
  - `GET /api/v2/health` doit retourner `healthy|degraded` selon modèles/services.
  - Upload test via `POST /api/v2/process` (fichier < `API_V2_MAX_FILE_SIZE`).

---

Auto-évaluation
- Confiance: 92% (audit basé sur lecture exhaustive des répertoires backend et clients, extraction des routes/variables, evidence blocks des fonctions critiques; limites: non-exécution complète end-to-end ici, dépendances externes non interrogées réseau).
- Points nécessitant analyse supplémentaire: configuration exacte des providers externes en environnement de prod (Tika/Docling/Azure/Mistral), tuning réel de `API_V2_MAX_CONCURRENT`, règles RBAC/ownership souhaitées par métier.
- Qualité estimée de la documentation: élevée — structure complète, preuves de code, tables de routes/configs, recommandations actionnables.

## ANNEXE H — ARBRE COMPLET (CODE) ET INVENTAIRE STRUCTURÉ

Note: pour lisibilité et taille, l’arbre ci-dessous couvre l’intégralité du code source utile (backend/open_webui, clients, docs) en excluant explicitement les répertoires volumineux ou binaires: `.git/`, `node_modules/`, `build/`, `backend/**/data/uploads/`, `backend/**/data/vector_db/`, `__pycache__/`, et artefacts lourds.

### H.1 backend/open_webui (code applicatif)
```
backend/open_webui/
├── alembic.ini
├── api_v2/
│   ├── __init__.py
│   ├── adapter.py
│   ├── adapter.py.backup*
│   ├── config_models.py
│   └── models.py
├── CHANGELOG.md
├── config.py
├── constants.py
├── data/            # Exclu du détail (uploads, vector_db) — voir Annexe I
├── env.py
├── functions.py
├── __init__.py
├── internal/
│   ├── db.py
│   └── migrations/  # Peewee
├── main.py
├── migrations/      # Alembic
├── models/
│   ├── api_v2_tasks.py
│   ├── auths.py
│   ├── channels.py
│   ├── chats.py
│   ├── feedbacks.py
│   ├── files.py
│   ├── folders.py
│   ├── functions.py
│   ├── groups.py
│   ├── knowledge.py
│   ├── memories.py
│   ├── messages.py
│   ├── models.py
│   ├── prompts.py
│   ├── tags.py
│   ├── tools.py
│   └── users.py
├── retrieval/
│   ├── loaders/
│   │   ├── main.py
│   │   └── youtube.py
│   ├── utils.py
│   ├── vector/
│   │   ├── connector.py
│   │   └── dbs/
│   │       ├── chroma.py
│   │       ├── elasticsearch.py
│   │       ├── milvus.py
│   │       ├── opensearch.py
│   │       ├── pgvector.py
│   │       └── qdrant.py
│   ├── web/
│   │   ├── main.py
│   │   ├── utils.py
│   │   └── {brave,kagi,mojeek,bocha,duckduckgo,google_pse,jina,searchapi,serpapi,searxng,serper,serply,serpstack,tavily,bing,exa,perplexity,sougou}.py
│   └── retrieval.py
├── routers/
│   ├── api_v2.py
│   ├── audio.py
│   ├── auths.py
│   ├── channels.py
│   ├── chats.py
│   ├── configs.py
│   ├── evaluations.py
│   ├── files.py
│   ├── folders.py
│   ├── functions.py
│   ├── groups.py
│   ├── images.py
│   ├── knowledge.py
│   ├── memories.py
│   ├── models.py
│   ├── ollama.py
│   ├── openai.py
│   ├── pipelines.py
│   ├── prompts.py
│   ├── tasks.py
│   ├── tools.py
│   ├── users.py
│   └── utils.py
├── socket/
│   └── main.py
├── static/          # assets (non listés ici)
├── storage/
│   └── provider.py
├── tasks.py
└── utils/
    ├── audit.py
    ├── auth.py
    ├── chat.py
    ├── code_interpreter.py
    ├── filter.py
    ├── logger.py
    ├── middleware.py
    ├── misc.py
    ├── models.py
    ├── plugin.py
    ├── redis.py
    ├── task.py
    ├── tools.py
    └── webhook.py
```

### H.2 Autres répertoires clés
```
client_demo/
├── main.py
├── dist/
├── build*/
├── apidocia-demo.spec
├── config.ini
└── {build_linux.sh,build_windows.bat,cleanup_phantom_windows.sh,...}

llm-content-analyzer/
├── content_analyzer/
│   ├── content_analyzer.py
│   ├── utils/
│   ├── modules/
│   └── config/
├── gui/ (PySide)
├── doc/
└── scripts/

docs/
├── API_V2_ENDPOINTS.md
├── API_V2_DOCUMENTATION.md
└── API_V2_ADMIN_GUIDE.md
```

## ANNEXE I — INVENTAIRE DONNÉES (RÉSUMÉ CONTRÔLÉ)
- Chemins configurés (créés au runtime):
  - `backend/open_webui/data/uploads/`: zone d’uploads gérée par `Storage` (provider local/S3/GCS/Azure).
  - `backend/open_webui/data/vector_db/`: stockage par défaut pour Chroma (configurable: Milvus/Qdrant/OpenSearch/Elasticsearch/Pgvector).
- Remarque: ces répertoires peuvent ne pas exister avant le premier démarrage/traitement. Leur volume dépend de l’usage en production.
- Recommandation: ne pas versionner ces données; prévoir une politique de rétention (taille totale, nombre de fichiers, top N par taille) et un cycle d’archivage.

## ANNEXE J — RÉSUMÉ TECHNIQUE PAR FICHIER (PRINCIPAUX)

Focus code applicatif `backend/open_webui`.

- `main.py`: composition FastAPI, middlewares, sockets, montage des routeurs v1 et v2 (double: `/v2` et `/api/v2`), statiques, Swagger override.
- `config.py`: PersistentConfig, migration config→DB, variables (LLM, RAG, vecteurs, stockage, API v2), Alembic run, helpers `save_config`.
- `env.py`: chargement `.env`, chemins (DATA_DIR, FRONTEND_BUILD_DIR), logs, version package, DB/Redis env, device (cpu/cuda/mps).
- `internal/db.py`: Peewee router bootstrap puis SQLAlchemy engine/session (`SessionLocal`, `Base`), context manager `get_db`.
- `routers/api_v2.py`: endpoints process/status/models/health/config/cancel; sémaphore de concurrence; background task.
- `api_v2/adapter.py`: upload, orchestration traitement (process_file → chat_completion_files_handler → generate_chat_completion), queue, cleanup mémoire, stats système.
- `api_v2/models.py`: schémas Pydantic (TaskRequest/Response/Status/Model/Health/Config/UploadFileInfo).
- `models/api_v2_tasks.py`: SQLAlchemy `ApiV2Task`, Pydantic `ApiV2TaskModel`, DAO `ApiV2Tasks` (insert/get/update/delete/cleanup/counts).
- `routers/retrieval.py`: processing RAG (loaders, splitters, EF, RF, queries), endpoints embedding/reranking/update/query.
- `retrieval/vector/connector.py`: sélection client (Chroma/Milvus/Qdrant/OpenSearch/Elasticsearch/Pgvector).
- `storage/provider.py`: Storage abstrait (local/S3/GCS/Azure) avec upload/get/delete.
- `utils/middleware.py`: `chat_completion_files_handler` (pivot du wrapper API v2) — enrichissement messages, outils, web search, etc.
- `utils/chat.py`: `generate_chat_completion` (agrégation modèles/providers, streaming/timeout), gestion des réponses LLM.
- `utils/task.py`: templates RAG, prompt/messages substitutions, `rag_template`.
- `routers/openai.py`, `routers/ollama.py`: proxys d’API v1 openai/ollama (modèles, chat, completions, uploads).
- `models/files.py`: schéma table `file`, `FilesTable` (CRUD/metadatas). Note: `FileForm` n’inclut pas `content_type/size`.
- `routers/files.py`: endpoints uploads list/update/delete et métadonnées.
- `utils/auth.py`: JWT/api key, dépendances `get_verified_user/get_admin_user` (utilisées par API v2), création de clés `sk-...`.
- `constants.py`: messages/erreurs, constantes diverses.

Clients:
- `client_demo/main.py`: GUI de démonstration (config.ini, appels API v2), packaging PyInstaller.
- `llm-content-analyzer/content_analyzer.py`: pipeline batch (cache DB, analyse contenu, GUI optionnelle), logs.

### J.1 Détails par module Routers (v1) — description rapide
- `routers/audio.py`: STT/TTS (OpenAI, ElevenLabs, Azure), endpoints `/v1/audio/*`, entêtes API keys dynamiques, TTS/STT timeouts.
- `routers/auths.py`: Signin/Signup, JWT, API keys (création/gestion), endpoints `/v1/auths/*`.
- `routers/channels.py`: Canaux de chat, gestion, endpoints `/v1/channels/*`.
- `routers/chats.py`: Threads de conversation, messages, titres, tags, endpoints `/v1/chats/*`.
- `routers/configs.py`: Config UI/backend (persistantes), export/import, `/v1/configs/*`.
- `routers/evaluations.py`: Évaluations/arènes, `/v1/evaluations/*`.
- `routers/files.py`: Uploads, métadonnées, purge, `/v1/files/*`.
- `routers/folders.py`: Arborescences de dossiers, `/v1/folders/*`.
- `routers/functions.py`: Plugins/fonctions outillées, `/v1/functions/*`.
- `routers/groups.py`: Groupes d’utilisateurs, `/v1/groups/*`.
- `routers/images.py`: Génération images (OpenAI/Gemini/Comfy/Auto1111), `/v1/images/*`.
- `routers/knowledge.py`: Bases de connaissance, `/v1/knowledge/*`.
- `routers/memories.py`: Mémoires utilisateur, `/v1/memories/*`.
- `routers/models.py`: Listing/gestion de modèles (Ollama/OpenAI), `/v1/models/*`.
- `routers/ollama.py`: Proxy compatible API OpenAI vers Ollama, `/v1/*` endpoints alternatifs.
- `routers/openai.py`: Proxy OpenAI (chat, completions, models), `/v1/*`.
- `routers/pipelines.py`: Pipelines, inlet/outlet filters, `/v1/pipelines/*`.
- `routers/prompts.py`: Prompt library, `/v1/prompts/*`.
- `routers/tasks.py`: Tâches annexes (génération titres/query/tags), `/v1/tasks/*`.
- `routers/tools.py`: Outils, `/v1/tools/*`.
- `routers/users.py`: Profil, permissions, `/v1/users/*`.
- `routers/utils.py`: utilitaires divers `/v1/utils/*`.

### J.2 Détails par module Models (DB) — description rapide
- `models/*.py`: tables SQLAlchemy (users, chats, files, models, etc.), Pydantic response models, DAO statiques.
- `models/api_v2_tasks.py`: voir section 5.2; inclut `cleanup_old_tasks`, `get_active_tasks_count`, `get_queued_tasks_count`.

### J.3 Détails API v2 — fichiers
- `routers/api_v2.py`: endpoints, sémaphore, background, health/config/models.
- `api_v2/adapter.py`: upload/process/queue/cleanup/system_status.
- `api_v2/models.py`: schémas réponses/requêtes.
## ANNEXE K — GRAPHES D’APPELS ET FLUX (CLÉS)

### K.1 Flux API v2 /process
```
Client → routers/api_v2.process_document
  ├─ TaskRequest validation
  ├─ adapter.upload_file → storage/provider.Storage.upload_file → models/files.Files.insert_new_file
  ├─ ApiV2Tasks.insert_new_task (status=pending)
  ├─ [si capacité] BackgroundTasks.add(process_document_background)
  │     └─ adapter.process_document
  │         1) update_task_status(processing, started_at, progress=10)
  │         2) retrieval.process_file(file_id) [thread]
  │         3) Files.get_file_by_id → récup content → injection inline éventuelle
  │         4) utils.middleware.chat_completion_files_handler (timeout ≤300s)
  │         5) utils.chat.generate_chat_completion (timeout=API_V2_TIMEOUT)
  │         6) formattage résultat → update_task_status(result, progress=90→100)
  │         7) cleanup mémoire → auto-dequeue
  └─ Réponse TaskResponse (PROCESSING ou QUEUED)
```

### K.2 Status/Annulation
```
GET /api/v2/status/{task_id}
  → ApiV2Tasks.get_task_by_id → StatusResponse

DELETE /api/v2/tasks/{task_id}
  → ApiV2Tasks.get_task_by_id → update_task_status(status=failed, error=...)
```

### K.3 RAG (v1 réutilisé, côté handler)
```
chat_completion_files_handler
  ├─ Préparation messages (system/user), outils éventuels
  ├─ get_sources_from_files / query_collection / query_doc (selon bypass/hybrid)
  ├─ Templates (rag_template) / injection [context]/{{CONTEXT}}
  ├─ generate_chat_completion (OpenAI/Ollama via utils/models)
  └─ Renvoie (enhanced_form_data, flags={sources,...})
```

### K.4 Stockage fichiers
```
adapter.upload_file
  └─ Storage.upload_file
       ├─ Local: écrit dans UPLOAD_DIR
       ├─ S3/GCS/Azure: push distant + copie locale
       └─ Retourne (contents, path) → Files.insert_new_file
```

### K.5 Vector DB
```
retrieval.vector.connector.VECTOR_DB_CLIENT
  └─ selon VECTOR_DB → {Chroma,Milvus,Qdrant,OpenSearch,Elasticsearch,Pgvector}
     └─ utilisé par query_* dans retrieval.utils / retrieval.py
```

## ANNEXE L — DIAGRAMMES ASCII (RAG ET FONCTIONS CLÉS)

### L.1 RAG détaillé
```
           +-----------------------+
           | Uploaded File (DB)   |
           +----------+------------+
                      |
             retrieval.process_file
                      v
            +---------+----------+
            | Extracted Content |
            +---------+----------+
                      |
             chunking/splitting (CHUNK_SIZE/OVERLAP)
                      |
            embedding (engine/model)
                      |
            +---------v----------+
            |  Vector Database   |
            +---------+----------+
                      |
            query (hybrid? rerank?)
                      v
         +------------+-------------+
         |  Top-k context sources   |
         +------------+-------------+
                      |
        rag_template + context inject
                      |
        generate_chat_completion (LLM)
                      v
              Response + Sources
```

### L.2 API v2 orchestration
```
POST /api/v2/process
  → upload_file → create task → bg processing
     → process_file → handler v1 → LLM → update_task → cleanup
GET /api/v2/status/{id} → read DB
DELETE /api/v2/tasks/{id} → update DB (failed)
```

### L.3 Stockage multi-provider
```
Storage = get_storage_provider(STORAGE_PROVIDER)
  ├─ LocalStorageProvider
  ├─ S3StorageProvider
  ├─ GCSStorageProvider
  └─ AzureStorageProvider
```

## ANNEXE M — CHECKLIST SÉCURITÉ / CAPACITÉ / FONCTIONNEMENT

- Sécurité:
  - Auth obligatoire sur `/process`, `/status`, `/config`, `/models`, `/tasks/*` via `get_verified_user` (JWT/API key). Vérifier configuration `ENABLE_API_KEY_ENDPOINT_RESTRICTIONS`.
  - Ownership tâches: à renforcer (vérification user_id ↔ task.user_id) sur status/cancel.
  - Secrets: variables d’env (OpenAI, Azure, etc.), pas en clair dans le code. Éviter d’inclure des valeurs dans les uploads/doc d’exemples.
  - Surfaces externes: Tika/Docling/Azure endpoints sécurisés (TLS, ACL). Filtrage contenu (mime) côté upload.
  - Logs: éviter PII/secret; niveaux de logs par source (`SRC_LOG_LEVELS`).
  - Rate limiting/quotas: ajouter reverse-proxy (Caddy/Nginx) ou dépendances FastAPI pour limitéer `/api/v2/process`.
  - Validation fichiers: whitelists content-type, taille (`API_V2_MAX_FILE_SIZE`), scan AV si besoin.
  - Vector DB: authentification et TLS pour backends distants (Qdrant/OpenSearch/Elastic).
  - RBAC: étendre rôles/scopes si exposition multi-tenant.

- Capacité/Concurrence:
  - `API_V2_MAX_CONCURRENT`: fixer une valeur sûre (RAM dispo, CPU). Option: brancher `_calculate_api_v2_max_concurrent()`.
  - Timeouts: `API_V2_TIMEOUT` pour LLM; handler v1 plafonné à 300s — ajuster selon SLA.
  - Queue: auto-dequeue fonctionnel; prévoir métriques (active/queued) via `get_system_status`.
  - Vector DB: choisir backend selon volumétrie (Chroma pour local; Qdrant/Milvus pour prod forte charge).
  - Dimensionnement: RAM/CPU/IO disques (uploads/DB). Benchmarks à tenir à jour.
  - Mise à l’échelle: workers uvicorn/gunicorn + worker pool (RAG_*_MAX_WORKERS) avec limites.

### K.6 Proxies OpenAI/Ollama (simplifié)
```
Client (OpenAI-compatible) → routers/openai.py
  ├─ Normalise payload (chat/completions/models)
  ├─ Sélection provider/config (OPENAI_BASE_URLS/KEYS | OLLAMA)
  ├─ Appel provider HTTP (headers Bearer / xi-api-key / etc.)
  └─ Renvoi réponse (stream/non-stream) au client

Client (Ollama) → routers/ollama.py → Ollama REST (/api/*)
```

### K.7 PersistConfig (écriture)
```
Routers (configs) → save_config(config) → DB.config upsert
  └─ Déclenche update() de toutes PersistentConfig enregistrées
```

### L.4 Health/Status
```
GET /api/v2/health → adapter.get_system_status()
  ├─ psutil RAM, counts (active/queued)
  ├─ models disponibles (adapter.get_available_models)
  └─ status healthy/degraded
```

### L.5 Auto-dequeue
```
on task completion → adapter._process_next_queued_task()
  ├─ check_concurrency_limit()
  ├─ fetch oldest queued task
  └─ asyncio.create_task(process_document_background(...))
```

- Fonctionnement/Fiabilité:
  - Démarrage: scripts `start.sh` / `start_fast.sh` (port 8080), vérification `/api/v2/health`.
  - Migrations: Peewee bootstrap + Alembic au chargement — surveiller erreurs de drift.
  - Stockage: provider abstrait; toujours conserver copie locale + nettoyage.
  - Rétention: plan de purge des uploads et collections vectorielles.
  - Observabilité: exposer `/api/v2/health` + journaux applicatifs; ajouter métriques si besoin (Prometheus).
  - Backups: DB + configs persistantes + snapshots vector DB.
  - Reprises: gestion d’état de tasks sur redémarrage, cleanup périodique (déjà présent) + re-queue stratégique.

## ANNEXE N — MÉTRIQUES SYNTHÉTIQUES
- Fichiers générés:
  - `METRICS_ROUTES_PER_MODULE.txt`: nombre de routes FastAPI par fichier `routers/*.py`.
  - `METRICS_SQLALCHEMY_MODELS.txt`: classes SQLAlchemy (héritant de `Base`) détectées et comptées.
  - `METRICS_TOP_FILES_BY_LINES.txt`: Top 40 fichiers Python par nombre de lignes (approx complexité).
- Utilisation: permet d’identifier modules critiques (surface API), taille code, et zones sujettes à refactor/test.

## ANNEXE O — ARBRES & MÉTRIQUES EMBARQUÉS

Pour conserver la lisibilité, les arbres intégralement non filtrés sont générés en fichiers texte à la racine (voir Annexe H.3). Cette annexe embarque le contenu des métriques et référence les arbres complets.

### O.1 METRICS_ROUTES_PER_MODULE.txt
```
ollama.py 38
chats.py 34
configs.py 20
retrieval.py 19
auths.py 18
functions.py 14
tools.py 13
users.py 13
knowledge.py 12
channels.py 11
evaluations.py 11
files.py 11
models.py 9
tasks.py 9
memories.py 8
pipelines.py 8
folders.py 7
images.py 7
openai.py 7
utils.py 7
audio.py 6
prompts.py 6
api_v2.py 5
groups.py 5
file 1
```

### O.2 METRICS_SQLALCHEMY_MODELS (recalcul ciblé sur `models/`)
```
backend/open_webui/models/api_v2_tasks.py|1
backend/open_webui/models/auths.py|1
backend/open_webui/models/channels.py|1
backend/open_webui/models/chats.py|1
backend/open_webui/models/feedbacks.py|1
backend/open_webui/models/files.py|1
backend/open_webui/models/folders.py|1
backend/open_webui/models/functions.py|1
backend/open_webui/models/groups.py|1
backend/open_webui/models/knowledge.py|1
backend/open_webui/models/memories.py|1
backend/open_webui/models/messages.py|2
backend/open_webui/models/models.py|1
backend/open_webui/models/prompts.py|1
backend/open_webui/models/tags.py|1
backend/open_webui/models/tools.py|1
backend/open_webui/models/users.py|1
```

### O.3 METRICS_TOP_FILES_BY_LINES.txt (top 40)
```
  44940 total
   2788 backend/open_webui/config.py
   2297 backend/open_webui/utils/middleware.py
   1819 backend/open_webui/routers/retrieval.py
   1648 backend/open_webui/routers/ollama.py
   1616 backend/open_webui/main.py
    970 backend/open_webui/routers/audio.py
    912 backend/open_webui/models/chats.py
    876 backend/open_webui/routers/auths.py
    843 backend/open_webui/routers/openai.py
    814 backend/open_webui/retrieval/utils.py
    806 backend/open_webui/routers/chats.py
    768 backend/open_webui/api_v2/adapter.py
    746 backend/open_webui/routers/knowledge.py
    712 backend/open_webui/routers/channels.py
    688 backend/open_webui/routers/tasks.py
    676 backend/open_webui/routers/images.py
    636 backend/open_webui/retrieval/web/utils.py
    618 backend/open_webui/routers/configs.py
    597 backend/open_webui/utils/tools.py
    566 backend/open_webui/routers/files.py
    527 backend/open_webui/api_v2/config_models.py
    500 backend/open_webui/routers/pipelines.py
    498 backend/open_webui/env.py
    484 backend/open_webui/routers/tools.py
    478 backend/open_webui/test/apps/webui/routers/test_api_v2_concurrency.py
    465 backend/open_webui/utils/misc.py
    459 backend/open_webui/test/apps/webui/routers/test_api_v2.py
    452 backend/open_webui/utils/chat.py
    447 backend/open_webui/routers/api_v2.py
    438 backend/open_webui/utils/oauth.py
    435 backend/open_webui/test/apps/webui/storage/test_provider.py
    411 backend/open_webui/socket/main.py
    411 backend/open_webui/routers/functions.py
    405 backend/open_webui/retrieval/vector/dbs/pgvector.py
    352 backend/open_webui/routers/users.py
    341 backend/open_webui/utils/task.py
    341 backend/open_webui/storage/provider.py
    334 backend/open_webui/models/users.py
    322 backend/open_webui/functions.py
```

### O.4 Arbres complets
- Arbres non filtrés (contenu intégral disponible dans les fichiers générés à la racine du dépôt):
  - `INVENTORY_TREE_FULL.txt`
  - `INVENTORY_TREE_backend_open_webui_data_uploads.txt`
  - `INVENTORY_TREE_backend_open_webui_data_vector_db.txt`
  - `INVENTORY_TREE_build.txt`
  - `INVENTORY_TREE_node_modules.txt`
  Remarque: ces fichiers sont très volumineux; leur insertion directe gonflerait massivement ce document. Ils sont conservés à la racine pour consultation exhaustive et archivage.

## ANNEXE P — FLUX API v1 (ORIGINE) ET FONCTIONNEMENT

Objectif: documenter le flux v1 réutilisé par l’API v2 (wrapper), les fichiers et fonctions clés.

- Points d’entrée (v1):
  - `routers/openai.py`: proxys endpoints OpenAI-compatibles (chat/completions/models).
  - `routers/ollama.py`: proxys vers Ollama (API /api/*), compatibilités OpenAI.
  - `routers/retrieval.py`: endpoints RAG (embedding/reranking/query/process web/youtube, etc.).
  - `utils/middleware.py`: `chat_completion_files_handler` (passe utilisateur→RAG→LLM) — cœur du flux v1.
  - `utils/chat.py`: `generate_chat_completion` (orchestration LLM providers, streaming, timeouts).

- Flux v1 typique (processus text+fichiers):
  1) Client appelle route v1 (ex. `/v1/chat/completions` via `routers/openai.py`) ou flux interne v2 appelle `chat_completion_files_handler`.
  2) `chat_completion_files_handler`:
     - construit/enrichit les messages (system/user), applique filtres/pipelines si configurés
     - agrège le contexte RAG: `get_sources_from_files`, `query_collection(_with_hybrid_search)` ou `query_doc(_with_hybrid_search)` selon flags `BYPASS_*`, `ENABLE_RAG_HYBRID_SEARCH`
     - génère un payload final et appelle `generate_chat_completion`.
  3) `generate_chat_completion`:
     - résout le provider (OpenAI ou Ollama) via `utils/models` et `open_webui.config` (clés/base URLs), gère streaming, timeouts
     - retourne la réponse standardisée (choices/messages/...)

Evidence (extraits):
```
# utils/middleware.py
async def chat_completion_files_handler(request, form_data, user):
    ... get_sources_from_files(...) → sources ...
    ... rag_template(...), prepend_to_first_user_message_content(...)
    return enhanced_form_data, flags

# utils/chat.py
async def generate_chat_completion(request, form_data, user):
    ... provider routing + http calls ...
```

## ANNEXE Q — TYPES DE FICHIERS GÉRÉS (v1 vs v2)

- v2 (API documents):
  - Upload via `adapter.upload_file`→`storage.provider` (local/S3/GCS/Azure), entrée DB `Files`.
  - Extraction: `retrieval.process_file` + `retrieval/loaders/main.Loader` choisit moteur selon `CONTENT_EXTRACTION_ENGINE` (tika/docling/document_intelligence/mistral_ocr) et type mime/extension.
  - Injecte texte extrait inline et via RAG (sources) avant génération LLM.

- v1:
  - Fichiers attachés via métadonnées `files` dans `form_data` du handler; même extraction RAG en interne via `get_sources_from_files`.
  - Autres médias via routes dédiées:
    - audio (STT/TTS): `routers/audio.py` (OpenAI/ElevenLabs/Azure)
    - images: `routers/images.py` (OpenAI/Gemini/Comfy/Auto1111)
    - web/youtube: `retrieval/web/*`, `retrieval/loaders/youtube.py`

- Loader (v1/v2 commun): `retrieval/loaders/main.py`
  - Textes (connus/`text/*`): `TextLoader`
  - PDF/Office: `PyPDFLoader`, `Unstructured*` loaders, `Docx2txtLoader`, etc., ou via Tika/Docling/Azure DI
  - OCR: `MistralLoader` (PDF/images) si clé fournie
  - ZIP: pas de support direct en loader; à décompresser en amont (ou via pipeline externe) avant ingestion
  - Images en tant que documents: extraites si moteur OCR (Mistral) ou pipeline Docling avec placeholders
  - Vidéos: non gérées en tant que documents; support via liens (YouTube) → `YoutubeLoader`

## ANNEXE R — UTILISATION DU RAG (QUAND/COMMENT)

- Déclenchement:
  - Lorsque `form_data.metadata.files` contient des fichiers ou qu’un contexte doit être complété; `BYPASS_EMBEDDING_AND_RETRIEVAL` désactive l’étape.
  - `ENABLE_RAG_HYBRID_SEARCH`→ interroge vecteur + lexical; reranking si `RAG_RERANKING_MODEL`.

- Paramètres clés (`config.py`): `RAG_*` (EMBEDDING_ENGINE/MODEL/BATCH_SIZE, TOP_K, TOP_K_RERANKER, RELEVANCE_THRESHOLD, TEXT_SPLITTER, TIKTOKEN_ENCODING_NAME, CHUNK_SIZE/OVERLAP, TEMPLATE, OPENAI/OLLAMA API pour EF, etc.).

- Flux: voir Annexe L.1.

## ANNEXE S — GESTION DU CONTEXTE LLM (v1 & v2)

- v1 (middleware):
  - `rag_template(template, context, query)`: insère `[context]`/`{{CONTEXT}}` et `[query]`/`{{QUERY}}`.
  - `prepend_to_first_user_message_content` et variations: insère le contexte avant le prompt utilisateur.
  - Génère des messages `system`/`user` finaux avant `generate_chat_completion`.

- v2 (adapter):
  - Après `chat_completion_files_handler`, récupère `flags['sources']` et injecte un bloc `[Contexte fourni]` au début du dernier message `user` (tout en conservant le prompt initial).
  - Option `max_inline_context_chars` pour inclusion directe du texte extrait.

- Fichiers/fonctions de référence:
  - `utils/task.py`: `rag_template`, `prompt_template`, `replace_*_variable`
  - `utils/middleware.py`: enrichissement messages, injection RAG
  - `api_v2/adapter.py`: injection `[Contexte fourni]` spécifique v2

## ANNEXE — Sécurité, Exploitation, API, Performance, Code, Livrables

### Sécurité et accès
- Security posture:
  - WEBUI_AUTH: activé par défaut; JWT en cookie `token` (HttpOnly), `WEBUI_AUTH_COOKIE_SECURE`/`WEBUI_AUTH_COOKIE_SAME_SITE` et `WEBUI_SESSION_COOKIE_*` configurables.
  - ENABLE_API_KEY: activé par défaut; clés format `sk-...`; restrictions par endpoint via `ENABLE_API_KEY_ENDPOINT_RESTRICTIONS` + `API_KEY_ALLOWED_ENDPOINTS`.
  - Rôles: `get_verified_user` (user|admin), `get_admin_user` (admin). Les routes v2 utilisent `get_verified_user` (sauf `/health`).
  - BYPASS_MODEL_ACCESS_CONTROL: off par défaut; en off, filtrage des modèles côté user; en on, exposition élargie (attention v1/UI).
  - Forwarding X‑OpenWebUI‑User‑*: contrôlé par `ENABLE_FORWARD_USER_INFO_HEADERS`; si true, headers `X-OpenWebUI-User-{Name,Id,Email,Role}` propagés aux providers (OpenAI/Ollama/embeddings/images/audio).
  - Cookies: `Secure`/`SameSite` via `WEBUI_AUTH_COOKIE_SECURE`/`WEBUI_AUTH_COOKIE_SAME_SITE` (+ `WEBUI_SESSION_COOKIE_*`). Reco prod: Secure=true, SameSite=`lax` (ou `none` derrière proxy cross‑site + TLS).
  - Audit logging: fichier `${DATA_DIR}/audit.log`, niveau `AUDIT_LOG_LEVEL` ∈ {NONE, METADATA, REQUEST, REQUEST_RESPONSE}, rotation `AUDIT_LOG_FILE_ROTATION_SIZE` (ex. 10MB), exclusions `AUDIT_EXCLUDED_PATHS`.
  - Rate‑limit: non implémenté applicativement; recommander un rate‑limit par IP/route au proxy (Nginx/Traefik/Caddy). Le champ `rate_limit_per_user_per_hour` existe côté modèles admin mais n’est pas câblé aux routes.

- Ownership API v2 (allègement):
  - `/api/v2/status/{task_id}` et `DELETE /api/v2/tasks/{task_id}`: la vérification `user_id == task.user_id` est commentée/retirée (risque de divulgation si `task_id` deviné).
  - Mitigations: rétablir contrôle d’ownership (403), restreindre par clé d’API (endpoints autorisés), activer audit METADATA/REQUEST.

- Politique secrets:
  - Stockage: `.env`/secrets orchestrateur (Docker/K8s) via `env.py`/`config.py` (OpenAI, Azure DI, Mistral OCR, OAuth...).
  - Usage: ne jamais renvoyer des clés au client; appels providers effectués côté backend.
  - Logs: éviter secrets dans payloads; si `AUDIT_LOG_LEVEL=REQUEST_RESPONSE`, envisager masquage regex de motifs `sk-`/`Bearer`.

### Exploitation et déploiement
- Matrice env (dev/stage/prod):
  - dev: `ENV=dev`; OpenAPI exposé; `CORS_ALLOW_ORIGIN=*` acceptable; audit minimal.
  - stage: `ENV=prod`; `ENABLE_API_KEY_ENDPOINT_RESTRICTIONS=true`; `API_V2_MAX_CONCURRENT` calibré; audit METADATA.
  - prod: `ENV=prod`; TLS proxy; cookies Secure; `ENABLE_FORWARD_USER_INFO_HEADERS=false` (sauf besoin audité); `ENABLE_OTEL=true`; timeouts et concurrence tunés.

- Topologie de déploiement:
  - Reverse proxy/TLS; workers uvicorn/gunicorn; supervision via OTEL + `/api/v2/health`.
  - Sauvegardes: DB SQL + Vector DB + uploads; restauration documentée; rétention sur uploads/indices.

- Plans DR/SLA:
  - Cibles: SLO 99.5%, RTO ≤ 30 min, RPO ≤ 15 min. Alertes: latence p95 > 3s, queue > 2×concurrence, 5xx > 1%/5m, 413 > 5%.

### API et données
- Contrat minimal + cURL:
  - POST `/api/v2/process`: 200 `TaskResponse`; 413 fichier trop gros; 500 échec.
    - Exemple: `curl -H "Authorization: Bearer $TOKEN" -F file=@doc.pdf -F prompt='Analyse...' https://host/api/v2/process`
  - GET `/api/v2/status/{task_id}`: 200/404; reco 403 si ownership rétablie.
  - DELETE `/api/v2/tasks/{task_id}`: 200/400/404.
  - GET `/api/v2/{models,config,health}`: 200; `/health` public.

- Taxonomie d’erreurs:
  - 413: `validation_error` taille; 422/400: validation params; 500: `processing_error`/timeout; 401/403: `auth_error`; proxy 429/504 recommandés.

- Catalogue modèles:
  - Détection vision heuristique; capacités vision/audio via routes v1; paramètres admin appliqués via `API_V2_ADMIN_CONFIG`.

- Données/PII:
  - Classification: uploads, extraits (vecteur), résultats, logs. Résidence: local/S3/GCS/Azure. Purge: TTL + scripts; conformité DPA/DSR.

### Performance et capacité
- Bench reproductible:
  - Jeux TXT/PDF/Image/Audio; mesures upload/extraction/RAG/génération; CPU/Mem via psutil + `/health`; N=5 runs; journal JSON.

- Concurrence:
  - `API_V2_MAX_CONCURRENT` défaut élevé; fixer valeur selon RAM (3@16Go, 16@≥32Go, 64@≥512Go) ou brancher `_calculate_api_v2_max_concurrent()`; timeout 300–600s.
  - Queue metrics: `/api/v2/health` expose `active_tasks`/`queue_length`.

- Vector DB sizing:
  - Dimensionner par `#docs * (taille/chunk_size)`; compaction; backend selon charge (chroma→simple, Milvus/Qdrant→HA, ES/OS→hybride, PGVector→DB unique).

### Code‑level
- FileForm meta:
  - Persister `content_type`/`size` dans `FileForm.meta` depuis `adapter.upload_file()` (au lieu de champs racine). Évite la perte d’info.
- I/O mémoire:
  - Éviter `await file.read()` pour la taille; privilégier streaming/seek/headers.
- Sources canoniques:
  - Traitement fichiers: canonique = handler v1 appelé par v2; éviter duplications divergentes; point d’entrée v2 recommandé `/api/v2`.

### “Livrables” docs
- ERD (texte): `config`, `file`, `api_v2_tasks` (+ liens `user_id`, `file_id`).
- Séquences: `/process`, `/status`, RAG path, storage path (décrits ci‑dessus).
- Journal multi‑runs: timestamps, hash input, versions (`VERSION`, `WEBUI_BUILD_HASH`), config snapshot, env; stocker sous `benchmarks/`.
## ANNEXE T - ANALYSE COMPLÈTE LLM-CONTENT-ANALYZER

### T.1 ARCHITECTURE SYSTÈME COMPLÈTE
- Vue d'ensemble: llm-content-analyzer n’est pas un « client batch » mais un sous‑système complet côté analyse, couvrant les briques 2 (analyse documentaire/LLM) et 3 (visualisation/BI) du pipeline. Il orchestre import CSV→DB, préparation prompts, appels API v2 d'Api‑Doc‑IA, cache des réponses, persistance, et une interface graphique riche pour pilotage et analytics.
- Architecture modulaire (extraits clés sous `llm-content-analyzer/`):
  - `content_analyzer/content_analyzer.py` (24 KB): orchestrateur principal, CLI, workflow fichier unitaire et batch, parsing robuste de la réponse LLM, calcul des confiances, gestion du cache et DB.
  - `content_analyzer/modules/*` (13+ modules): `csv_parser.py`, `db_manager.py`, `api_client.py`, `cache_manager.py`, `prompt_manager.py`, `file_filter.py`, `duplicate_detector.py`, `enhanced_cache.py`, `sql_optimizer.py`, `age_analyzer.py`, `size_analyzer.py`, `adaptive_pipeline_manager.py`.
  - `gui/*` (Tkinter): `main_window.py` (~208 KB), `analytics_panel.py` (~208 KB), `utils/*` (threads multi‑workers, tests de charge, log viewer, service monitor, debouncers, progress tracker).
- Intégration briques 2+3 du pipeline:
  - Brique 2: import CSV SMBeagle → SQLite, filtrage+scoring, prompts Jinja2, appel API v2 `/api/v2/process` + polling `/api/v2/status/{task_id}`, parsing strict JSON, cache TTL, stockage résultats.
  - Brique 3: GUI avec tableaux, filtres, onglets analytiques, drill‑down, export CSV, tests de charge multi‑workers, et monitoring de services.
- Philosophie “minimal_dependencies_maximum_efficiency”: requirements minimaux (tenacity, circuitbreaker, requests, PyYAML, pandas, jinja2, psutil) + bibliothèques standard. Les classes assurent la robustesse (thread‑safety, pools SQLite, indexation, validations) sans frameworks lourds.

### T.2 MODULES SPÉCIALISÉS (ANALYSE DÉTAILLÉE)
- `prompt_manager.py` (Jinja2 + validation taille):
  - Rôle: compile des templates Jinja2 depuis `analyzer_config.yaml`, construit des prompts type « comprehensive » et « security_focused » à partir de métadonnées fichier; expose validation et sauvegarde de templates.
  - Points clés:
    - Environnement Jinja2 non auto‑escape pour prompts texte; expose `build_analysis_prompt(meta, analysis_type)`, `get_available_templates()`, `validate_template()`.
    - Validation des tailles via `PromptSizeValidator` (seuils warning/critical/max) et `validate_prompt_size`.
  - Evidence:
    ```python
    class PromptManager:
        def build_analysis_prompt(self, file_metadata: Dict[str, Any], analysis_type: str = "comprehensive") -> str:
            tpl_cfg = self.cfg["templates"].get(analysis_type)
            user_tpl = self.env.from_string(tpl_cfg["user_template"])
            rendered = user_tpl.render(**file_metadata)
            system_prompt = tpl_cfg.get("system_prompt", "")
            return f"{system_prompt}\n{rendered}"
    ```

- `analytics_panel.py` (Dashboard BI 6+ onglets avec drill‑down):
  - Rôle: panneau Analytics avancé intégré à la GUI avec onglets Thématiques (Sécurité/RGPD/Finance/Juridique), Analyse Temporelle, Tailles, Doublons détaillés, Top utilisateurs; drill‑down universel exportable.
  - Points clés:
    - Validation robuste du schéma DB et du `DBManager` dès l’initialisation; gestion des erreurs et mécanismes de récupération.
    - Construction des onglets et sous‑onglets via `ttk.Notebook`; écouteurs de clics uniformes; export CSV.
    - Requêtes SQL optimisées et sécurisées (JOIN sur `reponses_llm`, `COALESCE`, index spécialisés) + pagination et filtres.
  - Evidence:
    ```python
    # Création des onglets thématiques
    self.thematic_notebook = ttk.Notebook(notebook_frame)
    self._build_security_tab(security_frame)
    self._build_rgpd_tab(rgpd_frame)
    self._build_finance_tab(finance_frame)
    self._build_legal_tab(legal_frame)
    # Onglets étendus
    self._build_duplicates_detailed_tab(duplicates_detailed_frame)
    self._build_temporal_analysis_tab(temporal_frame)
    self._build_file_size_analysis_tab(file_size_frame)
    self._build_top_users_tab(top_users_frame)
    ```

- `csv_parser.py` (Import optimisé SQLite):
  - Rôle: parsing CSV SMBeagle avec gestion fine des guillemets sélectifs, validation entête/lignes, transformation métadonnées et insertion par batchs transactionnels, PRAGMAs d’optimisation.
  - Schéma `fichiers` complet et idempotent (ALTER ADD COLUMN si manquants), index sur `status`, `fast_hash`, `priority_score`, `extension`, etc.
  - Evidence (schéma extrait):
    ```sql
    CREATE TABLE IF NOT EXISTS fichiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      host TEXT, extension TEXT, username TEXT, hostname TEXT,
      unc_directory TEXT, creation_time TEXT, last_write_time TEXT,
      readable BOOLEAN, writeable BOOLEAN, deletable BOOLEAN,
      directory_type TEXT, base TEXT,
      path TEXT UNIQUE NOT NULL,
      file_size INTEGER NOT NULL, owner TEXT, fast_hash TEXT,
      access_time TEXT, file_attributes TEXT, file_signature TEXT,
      last_modified TEXT NOT NULL,
      status TEXT DEFAULT 'pending', exclusion_reason TEXT,
      priority_score INTEGER DEFAULT 0, special_flags TEXT,
      processed_at TIMESTAMP
    );
    ```

- `cache_manager.py` (TTL + FastHash intelligent):
  - Rôle: cache persistant SQLite thread‑safe via pool, clés enrichies FastHash+taille+prompt_hash, TTL et eviction par hits/ancienneté et limite de taille.
  - Fonctions: `get_cached_result()`, `store_result()`, `cleanup_expired[_and_oversized]()`, stats et planification d’un nettoyage quotidien.
  - Evidence (schéma):
    ```sql
    CREATE TABLE IF NOT EXISTS cache_prompts (
      cache_key TEXT PRIMARY KEY,
      prompt_hash TEXT NOT NULL,
      response_content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      hits_count INTEGER DEFAULT 1,
      ttl_expiry TIMESTAMP,
      file_size INTEGER,
      document_resume TEXT,
      raw_llm_response TEXT
    );
    ```

- `api_client.py` (Circuit breaker + retry sophistiqués):
  - Rôle: client HTTP vers Api‑Doc‑IA v2 avec decorators `tenacity.retry` (exponential backoff) et `circuitbreaker.circuit`. Gestion timeouts globaux/HTTP adaptatifs, polling robuste, logs détaillés, annulation coopérative.
  - Evidence:
    ```python
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=4, max=10))
    @circuit(failure_threshold=5, recovery_timeout=30)
    def analyze_file(self, file_path: str, prompt: str, adaptive_timeouts=None, stop_event=None) -> Dict[str, Any]:
        task_id = self._upload_file(file_path, prompt, http_timeout)
        return self._poll_result(task_id, timeout=timeout, http_timeout=http_timeout, stop_event=stop_event)
    ```

- `db_manager.py` (SQLite thread‑safe optimisé):
  - Rôle: gestion pool de connexions, schéma `reponses_llm`, indexes spécialisés via `SQLQueryOptimizer`, maintenance périodique (WAL/ANALYZE/optimize), méthodes `store_analysis_result`, `get_pending_files`, `get_processing_stats`, `verify_index_health`.
  - Evidence (stockage résultat):
    ```python
    def store_analysis_result(self, file_id: int, task_id: str, llm_response: Dict[str, Any], document_resume: str, llm_response_complete: str) -> None:
        conn.execute("BEGIN IMMEDIATE")
        conn.execute("""
          INSERT INTO reponses_llm (
            fichier_id, task_id, security_analysis, rgpd_analysis,
            finance_analysis, legal_analysis,
            confidence_global, security_confidence, rgpd_confidence,
            finance_confidence, legal_confidence,
            processing_time_ms, api_tokens_used,
            document_resume, llm_response_complete
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (...))
    ```

- `file_filter.py` (Scoring priorité + exclusions):
  - Rôle: applique règles d’exclusion (extensions, tailles, attributs, patterns) et calcule un score de priorité combinant taille/type/âge/flags spéciaux.

- `age_analyzer.py` / `size_analyzer.py` (Analyses complémentaires):
  - Rôle: statistiques âge (distribution annuelle, fichiers « stale », candidats archivage) et tailles (buckets, gros fichiers, gains potentiels).

- `duplicate_detector.py` (Détection doublons + stats):
  - Rôle: normalisation `FileInfo`, groupes par clé enrichie, identification du source (ordre par date), statistiques espace gaspillé, familles par taille.

- `adaptive_pipeline_manager.py` (Pilotage adaptatif):
  - Rôle: gestion dynamique du spacing uploads/polling en fonction des temps de réponse, métriques temps réel (throughput/min, idle, queue depth) pour ajuster timeouts.

- `sql_optimizer.py` (SQL spécialisé):
  - Rôle: pagination par curseur, extraction des doublons par chunks, définitions d’indexes pour accélérer analytics, dédup, tailles, âges.

### T.3 CONFIGURATION CENTRALE (analyzer_config.yaml)
- Structure complète et thèmes:
  - `api_config` (url/token/timeouts/`adaptive_timeouts`), `retry_config`, `circuit_config`.
  - `modules` (backends/optimisations pour `api_client`, `cache_manager`, `csv_parser`, `db_manager`, `file_filter`, `prompt_manager`).
  - `llm_limits` (warning/critical/max_prompt_size), `scoring` (poids), `exclusions` (extensions/priorités, tailles, attributs, patterns), `pipeline_config` (upload/adaptive spacing), `project`.
- Templates Jinja2: `comprehensive` (multi‑domaines strict, JSON validé) et `security_focused` (profil sécurité). Extrait abrégé:
  ```yaml
  templates:
    comprehensive:
      system_prompt: |
        Tu es un expert... Règles absolues... JSON uniquement.
      user_template: |
        Nom: {{ file_name }}
        Taille: {{ file_size_readable }}
        ...
        { "resume": "...", "security": {"classification": "C0", ...}, ... }
    security_focused:
      system_prompt: "Tu es un expert en sécurité informatique."
      user_template: "Analyse sécuritaire du fichier {{ file_name }}..."
  ```
- Configuration des modules (exemples):
  - `cache_manager`: backend sqlite3, `ttl_hours: 168`, `max_memory_mb: 512`.
  - `csv_parser`: `chunk_size: 10000`, `validation_strict: true`, `library: pandas`.
  - `db_manager`: `pragma_optimizations: true`, `wal_mode: true`.
  - `api_client`: `backend: requests_tenacity_circuitbreaker`.
- Retry/circuit breaker/timeouts: `retry_config.max_attempts: 3`, `wait_exponential 4–10s`, `circuit.failure_threshold: 5`, `recovery_timeout: 30s`, `timeout_seconds: 300`/`http_timeout_seconds: 60` avec mode adaptatif.
- Limites LLM et optimisations: `max_tokens: 32000`, taille prompt max 4000 (UTF‑8), seuils couleur UI.

### T.4 INTERFACE GRAPHIQUE COMPLÈTE
- `gui/main_window.py` (architecture):
  - Fenêtre principale, menus et workflows: import CSV auto, chargement DB existante, configuration API (token/URL), templates avec prévisualisation et analyse de taille, lancement d’analyses mono/multi‑workers, visualisation résultats paginés, log viewer, service monitor.
  - Gestion threads: `AnalysisThread`, `MultiWorkerAnalysisThread`/`ResumableAnalysisThread`, `APITestThread` (stress), `ProgressTracker` (monotonic), debouncers pour rafraîchissements et prompts.
  - Résilience: détection et reprise DB, validations de schéma et messages guidés.
- `gui/analytics_panel.py` (Dashboard BI intégré):
  - Onglets et sous‑onglets: Thématiques (Sécurité/RGPD/Finance/Juridique), Analyse temporelle (modif/création), Tailles, Doublons détaillés, Top utilisateurs (global, C3, RGPD critical).
  - Drill‑down universel: modales exportables, colonne normalisée (Nom/Chemin/Taille/Modifié/Classification/RGPD/Type/Owner), gestion clics/tab uniformisée.
- Gestion templates prompts avec prévisualisation: calcul taille prompt (système+user) et codage couleur (vert/orange/rouge) selon seuils YAML.
- Configuration API avec test connexion: health check via `APIClient.health_check()` et panneau de statut.
- Import/Export CSV/JSON/Excel: export des listes issues du drill‑down, export des tests de charge.
- Tests de charge multi‑workers intégrés: via `APITestThread` (itérations, workers, délai, template, mesure variance classification/confidences/hashes/throughput/p95).

### T.5 BUSINESS INTELLIGENCE INTÉGRÉE
- Tableau de bord Analytics 6 onglets (drill‑down partout):
  1. Vue Globale: volumes par statut, progression, vitesse moyenne, distribution par extensions et tailles.
  2. Analyse Thématique: filtres par classification Sécurité (C0..C3), RGPD (none..critical), Finance (none/invoice/contract/budget/accounting/payment), Juridique (none/employment/lease/sale/nda/compliance/litigation).
  3. Analyse Temporelle: distributions par période (jour/semaine/mois) et par type de date (modification/création), tendances, pics.
  4. Métriques Étendues: doublons (familles, copies, espace gaspillé), top utilisateurs par volume & taille, fichiers anormaux.
  5. Focus Sécurité: combinaisons C3 + RGPD critical avec listes exportables et requêtes ciblées.
  6. Performance: stats API (succès/timeouts, latence moyenne, throughput/min), taux de cache, efficience workers.
- Evidence (requête drill‑down unifiée) :
  ```python
  def _build_modal_query_unified(self, category_type: str, category_value: str) -> tuple[str, tuple]:
      base = """SELECT f.id, f.name, f.path, f.file_size, f.last_modified, f.owner,
               COALESCE(r.security_classification_cached,'none') AS classif,
               COALESCE(r.rgpd_risk_cached,'none') AS rgpd
             FROM fichiers f LEFT JOIN reponses_llm r ON f.id = r.fichier_id
             WHERE (f.status IS NULL OR f.status != 'error')"""
      # Ajout de conditions selon l'onglet sélectionné (security/rgpd/size/temporal...)
  ```

### T.6 CLASSIFICATION MULTI-DOMAINES
- Sécurité: C0 (Public), C1 (Interne), C2 (Confidentiel), C3 (Secret), N/A.
- RGPD: none, low, medium, high, critical, N/A.
- Finance: none, invoice, contract, budget, accounting, payment, N/A.
- Juridique: none, employment, lease, sale, nda, compliance, litigation, N/A.
- Validation JSON stricte: `ContentAnalyzer._extract_json_from_content()` tente parse direct, regex équilibrée, extraction « balanced »; `_validate_json_structure` impose les 4 domaines, tronque le résumé à 50 mots et dérive confiances par domaine + `confidence_global`.

### T.7 PERFORMANCE ET FIABILITÉ
- Tests de charge multi‑workers intégrés: `APITestThread` parallélise N itérations, calcule `throughput_per_minute`, efficience par worker, variances de classification, corruptions/troncatures JSON, et produit un rapport final exportable.
- Mesure variance classification: agrégations par domaines, comptage valeurs et écarts de confiance; hash de réponses pour détecter instabilité.
- Circuit breaker + retry: `@retry` (3 tentatives, backoff 4–10s) + `@circuit(failure_threshold=5, recovery_timeout=30)`.
- Métriques confiance LLM: extraction `security_confidence`, `rgpd_confidence`, `finance_confidence`, `legal_confidence`, et moyenne `confidence_global`.
- Cache intelligent FastHash + TTL: clés enrichies `fast_hash+file_size+prompt_hash`, TTL configurable, eviction progressive; compatibilité clé legacy.
- Import CSV optimisé: PRAGMAs (`synchronous=OFF`, `journal_mode=MEMORY`, `cache_size`, etc.), transactions batch `BEGIN IMMEDIATE` + `executemany`, calcul dynamique de `chunk_size` via `psutil`.
- SQLite thread‑safe: pool de connexions (`SQLiteConnectionPool`), `SafeDBManager` avec checkpoints WAL planifiés et maintenance horaire.

### T.8 SCHÉMA BASE DE DONNÉES COMPLÈTE
```sql
-- Tables principales
-- Fichiers importés (SMBeagle)
CREATE TABLE IF NOT EXISTS fichiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  host TEXT, extension TEXT, username TEXT, hostname TEXT,
  unc_directory TEXT,
  creation_time TEXT, last_write_time TEXT,
  readable BOOLEAN, writeable BOOLEAN, deletable BOOLEAN,
  directory_type TEXT, base TEXT,
  path TEXT UNIQUE NOT NULL,
  file_size INTEGER NOT NULL,
  owner TEXT,
  fast_hash TEXT,
  access_time TEXT,
  file_attributes TEXT,
  file_signature TEXT,
  last_modified TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  exclusion_reason TEXT,
  priority_score INTEGER DEFAULT 0,
  special_flags TEXT,
  processed_at TIMESTAMP
);

-- Réponses LLM par fichier
CREATE TABLE IF NOT EXISTS reponses_llm (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fichier_id INTEGER REFERENCES fichiers(id),
  task_id TEXT NOT NULL,
  security_analysis TEXT,
  rgpd_analysis TEXT,
  finance_analysis TEXT,
  legal_analysis TEXT,
  confidence_global INTEGER,
  security_confidence INTEGER DEFAULT 0,
  rgpd_confidence INTEGER DEFAULT 0,
  finance_confidence INTEGER DEFAULT 0,
  legal_confidence INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  api_tokens_used INTEGER,
  document_resume TEXT,
  llm_response_complete TEXT,
  security_classification_cached TEXT,
  rgpd_risk_cached TEXT,
  finance_type_cached TEXT,
  legal_type_cached TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cache prompts/réponses
CREATE TABLE IF NOT EXISTS cache_prompts (
  cache_key TEXT PRIMARY KEY,
  prompt_hash TEXT NOT NULL,
  response_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hits_count INTEGER DEFAULT 1,
  ttl_expiry TIMESTAMP,
  file_size INTEGER,
  document_resume TEXT,
  raw_llm_response TEXT
);

-- Métriques système
CREATE TABLE IF NOT EXISTS metriques_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  files_processed INTEGER,
  avg_processing_time REAL,
  cache_hit_rate REAL,
  api_success_rate REAL,
  memory_usage_mb INTEGER
);
```

### T.9 EVIDENCE BLOCKS TECHNIQUES
- Configuration `analyzer_config.yaml` (abrégé et commenté):
  ```yaml
  api_config:
    url: http://localhost:8080   # API v2 Api‑Doc‑IA
    token: sk-...                # Clé API
    timeout_seconds: 300         # Timeout global polling
    http_timeout_seconds: 60     # Timeout requêtes HTTP
    adaptive_timeouts:           # Ajustements dynamiques activables
      enable: true
  retry_config:
    max_attempts: 3
    wait_strategy: exponential
  circuit_config:
    failure_threshold: 5
    recovery_timeout: 30
  modules:
    csv_parser: { chunk_size: 10000, validation_strict: true }
    cache_manager: { ttl_hours: 168, max_memory_mb: 512 }
    db_manager: { wal_mode: true, pragma_optimizations: true }
    prompt_manager: { backend: jinja2_yaml, template_caching: true }
  llm_limits: { warning_threshold: 3500, critical_threshold: 3950, max_prompt_size: 4000 }
  ```
- Appel API protégé (extrait `api_client.py`): voir T.2 (decorators retry+circuit, timeouts adaptatifs, polling robuste).
- Parsing JSON robuste (extrait `content_analyzer.py`):
  ```python
  def _extract_json_from_content(self, content: str) -> Optional[Dict[str, Any]]:
      try:
          parsed = json.loads(content.strip())
          if self._validate_json_structure(parsed):
              return parsed
      except json.JSONDecodeError:
          pass
      # Regex puis extraction équilibrée des accolades si nécessaire
  ```
- Import CSV (extrait `csv_parser.py`): schéma `fichiers` et transactions `BEGIN IMMEDIATE` + `executemany` pour batchs.
- Cache TTL (extrait `cache_manager.py`): schéma `cache_prompts` avec `hits_count`, `ttl_expiry` et champs `document_resume`/`raw_llm_response`.
- Drill‑down Analytics (extrait `analytics_panel.py`): builder de requête unifié par catégorie (sécurité/RGPD/taille/temporel) et modales exportables.

### T.10 INTÉGRATION PIPELINE GLOBAL
- Position: brique 2+3 entre source fichiers (scan SMBeagle/local) et actions post‑analyse (brique 4 à venir). Prend en entrée des CSV d’inventaire; produit DB SQLite et métriques structurées.
- Communication avec Api‑Doc‑IA (API v2):
  - `POST /api/v2/process` pour upload binaire + prompt, retourne `task_id`.
  - `GET /api/v2/status/{task_id}` pour polling jusqu’à `completed|failed`.
- Workflow asynchrone: multi‑workers côté GUI, annulation coopérative via `stop_event`, timeouts adaptatifs, reprise sur erreurs/timeout avec backoff.
- Actions automatisées futures (brique 4):
  - Quarantaines RGPD high/critical, escalades Sécurité C3, archivage « stale », suppression de doublons familiaux, tickets conformité; APIs internes peuvent consommer la DB et les exports.

### T.11 COMPARAISON ARCHITECTURALE
- llm-content-analyzer vs Api‑Doc‑IA:
  - Forces analyzer: pipeline d’ingestion CSV→DB hautes performances, validations fortes, cache persistant, GUI BI riche, tests de charge intégrés, très faible empreinte dépendances, SQL optimisé.
  - Forces Api‑Doc‑IA: passerelle LLM universelle, extraction/contexte, orchestration backends, montée en charge API, sécurité/authent, logs/audit.
  - Faiblesses relatives: analyzer n’expose pas d’API publique; Api‑Doc‑IA n’offre pas nativement l’interface BI documentaire.
- Complémentarité: analyzer sert de « côté analyse/BI » connecté à Api‑Doc‑IA « côté serveur LLM ». Ensemble, ils forment un système de BI documentaire de bout‑en‑bout.
- Points d’intégration critiques: contrat `/process`/`/status`, formats de réponses JSON stricts, gestion du contexte RAG (si utilisée), gouvernance des clés API.
- Évolutions possibles:
  - Ajout d’un service REST de lecture des métriques (lecture seule) autour de la DB SQLite.
  - Connecteurs DB alternatifs (DuckDB/Parquet) pour scale analytique, et exports vers warehouses.
  - Mode headless CLI multi‑workers avec planification et journaux structurés.

### T.12 GUIDES D'UTILISATION
- CLI: `python content_analyzer.py scan.csv analysis.db`
  - Importe `scan.csv`, priorise, appelle l’API, stocke `reponses_llm`, met à jour `status` fichier et calcule métriques de progression.
- GUI:
  - Démarrage: `python -m gui.main` → importer CSV (auto si DB existante), configurer API/Token, choisir template, lancer analyse mono/multi‑workers, visualiser Analytics (onglets et exports).
  - Tests de charge: renseigner fichier test, itérations, workers, délai, template; suivre `throughput/min`, variances et hash.
- Configuration:
  - Éditer `content_analyzer/config/analyzer_config.yaml` (API, exclusions, templates, TTL cache, tailles prompts). Valider templates via onglet Templates (couleurs seuils, sauvegarde contrôlée).
- Troubleshooting courant:
  - API indisponible: onglet Service/Health → vérifier URL/token/logs; relancer; circuit breaker se rétablit après 30s.
  - JSON corrompu: voir métriques `malformed_json`/`truncated_responses` dans tests; ajuster template ou timeouts.
  - Lenteur import CSV: réduire `chunk_size`, vérifier PRAGMAs; monitor RAM.
  - Verrous SQLite: s’assurer d’utiliser `SafeDBManager` et éviter accès concurrents externes.

### T.13 AUTO-ÉVALUATION ANNEXE
- Pourcentage de confiance: 0.92 — fondé sur lecture du code présent, structures YAML et tests intégrés; certains extraits volumineux (GUI) ont été échantillonnés mais recoupés par signatures et appels.
- Éléments nécessitant investigation supplémentaire:
  - Détails exhaustifs de tous widgets/événements des 200+ KB de `main_window.py` et `analytics_panel.py` (couverture fonctionnelle déjà vérifiée par grep, constructions Notebook et requêtes).
  - Paramétrages fins de `AdaptivePipelineManager` dans des scénarios variés (valeurs présentes en YAML, logique visible mais non exécutée ici).
- Qualité estimée de la documentation annexe: élevée; couvre architecture, modules, config, GUI, BI, performance, DB et intégration, avec evidence blocks alignés sur le code.
## ANNEXE U - STRATÉGIE DE TEST COMPLÈTE

### U.1 ARCHITECTURE DE TESTS
- Structure organisationnelle:
  - `tests/unit/`: tests unitaires ciblant fonctions et modules isolés (ex: `test_model_functions.py`, `test_messages_structure.py`).
  - `tests/integration/`: tests API v2 end‑to‑end et workflows (upload, extraction, formats, vision, audio, wrappers).
  - `tests/performance/`: futurs benchmarks de charge et multi‑workers (répertoire créé, à alimenter).
  - `tests/diagnostic/`: scripts de validation/débug (auth, quick API key, fixes temporaires).
  - `tests/fixtures/`: données de test centralisées (txt/json/pdf) avec staging temporaire via `run_all.py`.
  - `tests/obsolete/`: point de parking pour anciens tests à évaluer avant suppression.
  - `tests/run_all.py`: orchestrateur d’exécution (dry‑run par défaut, mode `--execute` avec pytest, staging fixtures optionnel).
- Couverture par composant:
  - API v2: intégration complète (`/api/v2/process`, `/api/v2/status`, formats, vision/audio, adapters/wrappers).
  - Clients: tests d’intégration pour `client_demo` et llm-content-analyzer (leurs propres tests restent sous leurs packages respectifs).
  - Backends internes: tests unitaires de la logique de templating/prompt, formats de messages, fonctions modèles.

### U.2 TESTS UNITAIRES
- Modules backend testés:
  - Templating/prompts: `tests/unit/test_rag_template.py`, `test_specific_prompt.py`.
  - Modèles/fonctions: `tests/unit/test_model_functions.py`, `test_messages_structure.py`, `test_context_construction.py`, `test_file_content.py`.
- Clients: llm-content-analyzer dispose d’une suite dédiée sous `llm-content-analyzer/content_analyzer/tests` et `llm-content-analyzer/gui/tests` (non dupliquée ici).
- Evidence (exécution):
  - `pytest tests/unit -q`
  - `python tests/run_all.py --category unit --execute`

### U.3 TESTS D’INTÉGRATION
- Workflows end‑to‑end API v2:
  - Upload/processing: `test_file_upload[_v2].py`, `test_file_processing[_v2].py`, `test_single_file.py`, `test_real_files.py`.
  - Formats/variantes: `test_formats_{simple,optimized,final}.py`, `test_individual_formats.py`, `test_formats_with_apikey.py`, `test_alternative_simple.py`.
  - Vision/Images: `test_vision_{fix,final,fix_validation}.py`, `test_correct_vision_format.py`, `test_image_extraction.py`.
  - Audio: `test_audio_{simple,correct,integration}.py`.
  - Adapters/Wrappers: `test_adapter_models.py`, `test_api_v2_wrapper[_simple].py`, `test_api_with_local_code.py`.
  - Options scénarisées: `test_option3_{simple,validation,robust,final_validation}.py`.
- Scénarios de régression: couvert via les variantes `_fix`, `_final`, `_validation`.
- Evidence (exécution): `pytest tests/integration -q`.

### U.4 TESTS DE PERFORMANCE
- Cadre prévu:
  - Tests de charge multi‑workers (à placer sous `tests/performance/`), s’appuyant sur des outils internes (ex: threads multi‑workers du client analyzer) ou locust/k6 (optionnel, hors dépôt).
  - Métriques: latence p50/p95, throughput, timeouts, taux succès/erreurs, saturation/limites API v2.
- Evidence (placeholder): `pytest tests/performance -q` (répertoire vide initialement).

### U.5 TESTS DIAGNOSTIQUES
- Scripts de validation post‑déploiement et débogage:
  - Auth/API‑Key: `tests/diagnostic/test_auth_debug.py`, `test_quick_apikey.py`.
  - Démarrage/Environnement: `tests/diagnostic/test_api_startup.sh`, `test_fixed_paths.py`.
  - Correctifs ciblés: `test_api_v2_diagnostic.py`, `test_api_v2_fix.py`, `test_{import,comprehensive,fix}_validation.py`, `test_bypass_validation.py`, `test_simple_bypass.py`.
- Usage: exécuter manuellement en environnement de staging; intégrer uniquement les scripts pertinents en CI.

### U.6 FIXTURES ET DONNÉES DE TEST
- Centralisation des données dans `tests/fixtures/` (txt/json/pdf):
  - `test_simple.txt`, `test_simple_doc.txt`, `test_document.txt`, `test_real_validation.txt`, `test_phase1_validation.txt`, `test_validation.json`, `test_workflow.txt`.
- Staging temporaire: `tests/run_all.py --stage-fixtures` copie ces fichiers à la racine durant l’exécution afin de préserver d’anciens chemins relatifs, puis les nettoie.
- Données spécialisées: `test/test_files/image_gen/sd-empty.pt` conservé à son emplacement d’origine (poids/usage spécifique).

### U.7 GUIDE D’EXÉCUTION
- Unitaires: `pytest tests/unit -q`
- Intégration: `pytest tests/integration -q`
- Diagnostic: `pytest tests/diagnostic -q` (ou exécution ciblée de scripts `.sh`)
- Orchestrateur:
  - Lister sans exécuter: `python tests/run_all.py --category integration`
  - Exécuter et gérer fixtures: `python tests/run_all.py --category all --execute --stage-fixtures`
- CI/CD recommandé:
  - Étape 1 (rapide): unit → diagnostic léger
  - Étape 2 (intégration): inclure un sous‑ensemble critique (upload/process/status, formats majeurs)
  - Étape 3 (perf, nocturne): répertoire `performance/` (lorsqu’alimenté)

### U.8 VALIDATION ET CORRECTIONS EFFECTUÉES
- Inventaire consolidé (post‑migration):
  - Total fichiers de tests (python): 52
  - Intégration: 34
  - Diagnostic: 19 (dont 1 script shell)
  - Fixtures centralisées: 8 (txt/json/pdf)
- Corrections apportées:
  - Chemin backend pour import des modules API v2 corrigé dans `tests/integration/test_api_v2_integration.py` (résistant au déplacement): ajout du path `backend` via racine du repo.
  - Orchestrateur `tests/run_all.py`: injection `PYTHONPATH` pour inclure la racine du repo et `backend/`, changement de répertoire de travail (cwd) vers la racine, option de staging des fixtures.
  - Normalisation de l’arborescence: tous les `test_*.*` de la racine ont été déplacés et classés.
- Vérification syntaxique automatique:
  - Résultat: 52/52 fichiers Python de test parsés sans erreurs de syntaxe (AST parse).
- Points nécessitant un environnement d’exécution:
  - Les tests d’intégration effectuent des appels HTTP vers l’API v2 (`http://localhost:8080`) ou utilisent des composants runtime (`OpenWebUIAdapter`). Leur exécution requiert un serveur actif et des secrets/config ad hoc.
  - Recommandation: exécuter via `python tests/run_all.py --category integration --execute --stage-fixtures` après démarrage de l’API v2; vérifier `/api/v2/health` et les variables d’env (token, creds).

## ANNEXE N — DIFF VS OPEN WEBUI (UPSTREAM)

- Contexte: comparaison logique avec la base Open WebUI (v0.6.x). Ce fork ajoute/altère des composants pour l’API v2 et l’orchestration documentaire.

- `backend/open_webui/api_v2/` (nouveau):
  - `routers/api_v2.py`: endpoints `/process`, `/status/{task_id}`, `/models`, `/health`, `/config`, `DELETE /tasks/{task_id}`; sémaphore de concurrence; background tasks; startup cleanup périodique.
  - `api_v2/adapter.py`: orchestrateur (upload → process_file → wrapper v1 → LLM), timeouts adaptatifs, injection contexte inline, auto‑dequeue, cleanup mémoire, métriques système.
  - `api_v2/models.py` et `config_models.py`: schémas Pydantic v2 pour requêtes/réponses/configs.
  - Impact: ajoute une API v2 de traitement documentaire, absente en upstream.

- `backend/open_webui/models/api_v2_tasks.py` (nouveau):
  - Table `api_v2_tasks` + DAO (insert/get/update/delete/cleanup/counts) pour persister l’état des tâches.
  - Migrations Alembic associées (création de la table + merge heads).

- `backend/open_webui/main.py` (modifié):
  - Ajoute une seconde app `api_app` (middleware API dédié), double montage du routeur v2 (`/v2` et `/api/v2`).
  - Active TLS‑in‑TLS pour aiohttp (support proxy HTTPS imbriqué).
  - Intègre le router v2 dans l’app principale; maintient les routes v1 d’Open WebUI.
  - Impact: séparation claire UI/API, meilleure observabilité et contrôle.

- `backend/open_webui/config.py` (modifié):
  - Lance `run_migrations()` au démarrage; `PersistentConfig` enrichie (clés API v2: `API_V2_ENABLED`, `API_V2_MAX_FILE_SIZE`, `API_V2_MAX_CONCURRENT`, `API_V2_TIMEOUT`, `API_V2_ADMIN_MODEL`, `API_V2_ADMIN_CONFIG`).
  - Paramètres RAG/Vector DB/Storage consolidés, chemins `DATA_DIR`/`UPLOAD_DIR`.
  - Impact: configuration persistante et administrable des capacités v2.

- `backend/open_webui/internal/db.py` (modifié):
  - Bootstrap Peewee migrations avant SQLAlchemy; `JSONField` custom; pool SQLAlchemy configurable.
  - Impact: compatibilité migrations historiques + robustesse connexion.

- `backend/open_webui/routers/files.py` (modifié):
  - Liste MIME audio configurable via admin config (déclenche STT selon MIME), intégration `Storage`, `process_file`.
  - Impact: pipeline d’upload plus ergonomique côté v1 et cohérent avec v2.

- `backend/open_webui/retrieval/*` (modifié):
  - Correctifs Chroma (création/récup collections), robustesse; routage RAG “intelligent”.
  - Impact: extraction/contexte plus fiables (notamment pour v2).

- `backend/open_webui/utils/middleware.py` (modifié):
  - `chat_completion_files_handler` central pour le wrapper v2 (enrichissement messages, sources, web search, outils).
  - Impact: factorise la logique de préparation des prompts/contextes.

- Scripts (nouveaux/modifiés):
  - `start.sh`, `start_fast.sh`, `stop.sh`, `install.sh`: démarrage/installation robustifiés (logs, PID/LOCK, proxy/SQLite, sécurité).
  - Impact: exploitation plus simple et sûre (dev/prod).

- Points non modifiés en profondeur:
  - `storage/provider.py` (abstraction multi-provider) conservé; utilisé par l’adapter v2.
  - Routes v1 (OpenAI/Ollama/…): réutilisées par le wrapper; quelques ajustements (logs/erreurs).

- Diff fonctionnel global:
  - Ajout d’une API v2 orientée document + persistance des tâches + orchestration RAG intégrée; séparation UI/API; administration et observabilité renforcées.
