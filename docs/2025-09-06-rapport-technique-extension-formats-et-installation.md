# Rapport technique — Extension OpenDocument (ODT/ODS/ODP) + EPUB et améliorations d’installation

Date: 2025-09-06
Auteur: Équipe Api-Doc-IA

## Contexte et objectifs

- Étendre le support des formats de documents:
  - OpenDocument: ODT (texte), ODS (tableurs), ODP (présentations)
  - EPUB: extraction améliorée via ebooklib, avec fallback robuste
- Améliorer l’expérience d’installation/post-installation:
  - Détection/ajustement des permissions, chemins codés en dur, configuration .env
  - Réduction de la télémétrie non-essentielle et avertissements courants

## Résumé des changements (code et configuration)

- Loaders (backend):
  - Ajout et extension `OpenDocumentNativeLoader` (ODT/ODS/ODP)
    - Fichier: `backend/open_webui/retrieval/loaders/odt_loader.py`
    - Alias rétrocompatible: `OdtNativeLoader = OpenDocumentNativeLoader`
  - Ajout `EbookLibLoader` pour EPUB
    - Fichier: `backend/open_webui/retrieval/loaders/epub_loader.py`
  - Mise à jour de la sélection des loaders
    - Fichier: `backend/open_webui/retrieval/loaders/main.py`
    - Priorités conservées: Tika/Docling > natif
- Dépendances:
  - Ajout `ebooklib>=0.18`, `beautifulsoup4>=4.12.0`, `lxml>=4.9.0`
    - Fichier: `backend/requirements.txt`
- Post-installation et configuration:
  - Assistant de finalisation
    - Fichier: `install.sh` (fonction `post_install_finalize` + appel dans `main()`)
    - Actions:
      - Proposition de `sudo chown -R <user>:<group> <repo>` si nécessaire
      - Détection/correction de chemins absolus `/home/.../Api-Doc-IA` dans les scripts `.sh`
      - Correction optionnelle de `DATA_DIR` dans `start.sh` vers `$BACKEND_PATH/data`
      - Création de `.env` depuis `.env.example` et injection de clés utiles:
        - `CORS_ALLOW_ORIGIN=http://localhost:8080`
        - `CHROMADB_TELEMETRY=false`
        - `ANONYMIZED_TELEMETRY=false`
        - `JOBLIB_TEMP_FOLDER=${DATA_DIR}/tmp`
      - Création du répertoire `${DATA_DIR}/tmp`
  - Exemple de configuration enrichi
    - Fichier: `.env.example`
    - Ajouts: `CORS_ALLOW_ORIGIN`, `CHROMADB_TELEMETRY`, `ANONYMIZED_TELEMETRY`, `JOBLIB_TEMP_FOLDER`
- Documentation technique:
  - Fichier: `docs/2025-09-06-extension-formats-opendocument-epub.md` (architecture loaders)
  - Présent fichier (rapport complet)

## Détails techniques — Loaders

### OpenDocumentNativeLoader (ODT/ODS/ODP)

- Fichier: `backend/open_webui/retrieval/loaders/odt_loader.py`
- Formats pris en charge et MIMEs:
  - `odt` → `application/vnd.oasis.opendocument.text`
  - `ods` → `application/vnd.oasis.opendocument.spreadsheet`
  - `odp` → `application/vnd.oasis.opendocument.presentation`
- Fallbacks (ordre):
  1) `odfdo` (si disponible): extraction texte globale via `Document.get_text()`
  2) (réservé) `odfpy`
  3) `zip+xml` (lecture de `content.xml` via `zipfile` + `xml.etree`): robuste sans dépendances
- Découpe par type:
  - ODT: document unique, section `paragraph`
  - ODS: 1 Document par feuille (`sheet_name`), section `table`
  - ODP: 1 Document par slide (`slide_number`), section `slide`
- Métadonnées ajoutées dans les `Document`:
  - `format` (`odt` | `ods` | `odp`)
  - `section` (`paragraph` | `table` | `slide`)
  - `sheet_name` (ODS) | `slide_number` (ODP)
  - `Content-Type` (MIME officiel)
- Compatibilité ascendante:
  - `OdtNativeLoader = OpenDocumentNativeLoader`

### EbookLibLoader (EPUB)

- Fichier: `backend/open_webui/retrieval/loaders/epub_loader.py`
- Stratégie:
  - Si `ebooklib` présent:
    - Parse EPUB, itère les items `DOCUMENT`, extraction texte avec BeautifulSoup
    - Métadonnées: `format=epub`, `section=chapter`, `chapter=<id|chapter-N>`, `book_title` si disponible, `Content-Type=application/epub+zip`
  - Sinon (fallback): `UnstructuredEPubLoader` (si disponible via langchain)
- Performance typique: < 1s pour un EPUB de quelques centaines de Ko

### Sélection des loaders

- Fichier: `backend/open_webui/retrieval/loaders/main.py`
- Règles:
  - OpenDocument (odt/ods/odp ou MIME `application/vnd.oasis.opendocument.*`):
    - Si `self.engine == 'tika'` et `TIKA_SERVER_URL` défini → `TikaLoader`
    - Si `self.engine == 'docling'` et `DOCLING_SERVER_URL` défini → `DoclingLoader`
    - Sinon → `OpenDocumentNativeLoader`
  - EPUB (extension `.epub` ou MIME `application/epub+zip`):
    - `EbookLibLoader` (fallback interne vers Unstructured)

## Détails techniques — Installation et configuration

- `install.sh` (assistant de finalisation):
  - Vérifie propriété/écriture du dépôt → propose `sudo chown -R` si besoin
  - Détecte et remplace les chemins absolus `/home/.../Api-Doc-IA` dans les scripts `.sh` par le chemin réel du dépôt
  - Corrige optionnellement `export DATA_DIR=...` dans `start.sh`
  - Crée `.env` depuis `.env.example` si absent et injecte les clés recommandées
  - Crée `${DATA_DIR}/tmp` pour éviter les warnings `joblib` (mode série par permissions)
- `.env.example` enrichi:
  - `CORS_ALLOW_ORIGIN="http://localhost:8080"` (plus sûr que `*` en prod)
  - `CHROMADB_TELEMETRY=false` (supprime les erreurs de télémétrie)
  - `ANONYMIZED_TELEMETRY=false` (cohérence)
  - `JOBLIB_TEMP_FOLDER=${DATA_DIR}/tmp`

## Journal d’exécution — Observations

- Extraits significatifs (api_doc_ia.log):
  - EPUB: `EbookLibLoader` sélectionné, 17 documents, 0.61s
  - ODT: `OpenDocumentNativeLoader` sélectionné, 1 document, ~0s
  - ODS: `OpenDocumentNativeLoader` sélectionné, 1 document, ~0s
  - Avertissements non bloquants:
    - Télémétrie ChromaDB: erreurs `posthog` → résolues par `CHROMADB_TELEMETRY=false`
    - Clé OpenAI absente: `invalid_api_key` lors de list models (ignorable si non utilisé)
    - JSON auto-repair: réparations automatiques côté API v2 après réponse LLM (comportement attendu)

## Tests effectués

- Import et démarrage:
  - Import de `open_webui.main` OK après ajout des loaders (plus de crash ModuleNotFoundError)
- Tests d’extraction (manuels):
  - `.odt` (texte): extraction unique, section `paragraph` → OK
  - `.ods` (tableur): extraction par feuille (1 doc observé dans l’échantillon) → OK
  - `.epub`: 17 chapitres extraits avec métadonnées (titre du livre si dispo) → OK
- Vérification logs:
  - Aucun traceback lié aux nouveaux loaders
  - Performances conformes (<1s EPUB de 260KB, ~0s ODT/ODS < 120KB)

## Risques et mitigations

- Fichiers corrompus ou atypiques OpenDocument:
  - Mitigation: fallback `zip+xml` générique qui extrait tout le texte de `content.xml`
- EPUB riche (CSS/JS/Images):
  - Mitigation: extraction textuelle via BeautifulSoup; possibilité d’enrichir selon besoin
- Dépendances optionnelles:
  - Si `ebooklib` absent → fallback Unstructured; si `odfdo` absent → fallback zip+xml

## Rollback

- Pour revenir au comportement antérieur:
  - Réinstaurer l’ancienne sélection dans `backend/open_webui/retrieval/loaders/main.py` (supprimer les blocs OpenDocument/EPUB ajoutés)
  - Supprimer `backend/open_webui/retrieval/loaders/epub_loader.py`
  - Remplacer `backend/open_webui/retrieval/loaders/odt_loader.py` par la version précédente (ou renommer classe en `OdtNativeLoader` minimale)
  - En cas de gestion via git: `git revert` des commits associés

## Recommandations futures

- Implémenter une seconde couche `odfpy` dédiée avant le fallback `zip+xml`
- ODS: convertir les feuilles en Markdown (tables) avec gestion des colonnes/types
- ODP: extraire titres/notes/puces distinctement
- Ajout de tests automatisés (unitaires) pour ODT/ODS/ODP/EPUB

## Procédure d’utilisation

1) Activer l’environnement Conda:
   - `conda activate api-doc-ia`
2) Installer/mettre à jour les dépendances backend:
   - `pip install -r backend/requirements.txt`
3) Lancer le service:
   - `./start.sh`
4) (Optionnel) Vérifier la configuration `.env`:
   - `CHROMADB_TELEMETRY=false`, `CORS_ALLOW_ORIGIN`, `JOBLIB_TEMP_FOLDER`

## Annexe — Fichiers modifiés/ajoutés

- Ajout: `backend/open_webui/retrieval/loaders/epub_loader.py`
- Ajout/Extension: `backend/open_webui/retrieval/loaders/odt_loader.py`
- Modif: `backend/open_webui/retrieval/loaders/main.py`
- Modif: `backend/requirements.txt`
- Modif: `.env.example`
- Modif: `install.sh` (assistant de finalisation)
- Ajout doc: `docs/2025-09-06-extension-formats-opendocument-epub.md`
- Ajout doc (ce rapport): `docs/2025-09-06-rapport-technique-extension-formats-et-installation.md`

