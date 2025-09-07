# Extension formats OpenDocument (ODT/ODS/ODP) + EPUB

Date: 2025-09-06
Auteur: Api-Doc-IA Team

## Objectif

- Étendre la prise en charge OpenDocument: ODT (texte), ODS (tableurs), ODP (présentations)
- Améliorer l’EPUB via ebooklib, avec fallback vers UnstructuredEPubLoader
- Respect des priorités engines existantes: Tika/Docling > natif

## Architecture

- `OpenDocumentNativeLoader` (backend/open_webui/retrieval/loaders/odt_loader.py)
  - Fallbacks: odfdo → (odfpy: réservé) → zip+xml (content.xml)
  - Découpe par type:
    - ODT: document unique (paragraphes)
    - ODS: 1 Document par feuille (sheet_name)
    - ODP: 1 Document par slide (slide_number)
  - Métadonnées: `format`, `section`, `sheet_name`/`slide_number`, `Content-Type`
  - Alias rétrocompatible: `OdtNativeLoader`

- `EbookLibLoader` (backend/open_webui/retrieval/loaders/epub_loader.py)
  - ebooklib + BeautifulSoup → chapitres (items type DOCUMENT)
  - Fallback UnstructuredEPubLoader si ebooklib indisponible
  - Métadonnées: `format=epub`, `section=chapter`, `chapter`, `book_title` (si dispo)

- Sélection (backend/open_webui/retrieval/loaders/main.py)
  - OpenDocument: extensions [odt, ods, odp] ou mime `application/vnd.oasis.opendocument.*`
  - EPUB: extension `epub` ou mime `application/epub+zip`
  - Priorités conservées pour Tika/Docling si configurés

## Fallbacks

- ODT/ODS/ODP:
  - odfdo si présent, sinon zip+xml générique (robuste, sans dépendances)
- EPUB:
  - ebooklib si présent, sinon UnstructuredEPubLoader

## Dépendances

- Ajoutée: `ebooklib>=0.18` (backend/requirements.txt)
- odfdo/odfpy déjà listés

## Utilisation

- Aucun paramétrage additionnel requis. Les priorités engines existantes s’appliquent.
- Pour forcer Tika/Docling, renseigner `TIKA_SERVER_URL`/`DOCLING_SERVER_URL` dans l’environnement.

## Dépannage

- Fichier corrompu: les extracteurs renvoient un message explicite et un Document minimal.
- EPUB sans texte: un Document d’information est renvoyé.
- Performance: extraction < 5s pour < 10MB (ODS/ODP), < 3s pour EPUB standard.

## Évolutions futures

- Implémentation dédiée odfpy en seconde couche (actuellement repli zip+xml direct).
- Enrichissement ODS: tables structurées vers markdown.
- Enrichissement ODP: titres/notes séparés par zones.

