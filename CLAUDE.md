# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The product supports AI-chat-driven document drafting for all 11 supported document types with full user authentication and per-user document persistence.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed
- **PL-2** — CommonPaper legal templates checked into `templates/`; `catalog.json` indexes the 11 supported document types.
- **PL-3** — Next.js NDA creator prototype (superseded by PL-5/PL-6): established the `NDADocument` renderer and PDF print flow that remain in use today.
- **PL-4** — V1 technical foundation:
  - FastAPI backend in `backend/` (uv-managed, Python 3.12) serving the Next.js static export from the same origin on `:8000`.
  - SQLite DB created fresh on each container start (path: `/tmp/prelegal.db`).
  - Multi-stage Dockerfile (Node build → Python runtime).
  - `scripts/start-{mac,linux}.sh`, `scripts/start-windows.ps1`, and matching stop scripts. Override the host port with `PRELEGAL_PORT`.
  - Auth routes (`POST /api/auth/{signup,signin,signout}`, `GET /api/auth/me`) scaffolded; replaced with real implementation in PL-7.
- **PL-5** — AI chat replaces the manual NDA form:
  - `NDAChat` React component (`frontend/components/NDAChat.tsx`) drives a conversational UI; sends full message history + current fields to the backend each turn and updates the live document preview as fields are populated.
  - `backend/app/llm.py` calls `openrouter/openai/gpt-oss-120b` via LiteLLM with Cerebras as the inference provider, using structured outputs (`ChatLLMOutput`) to extract field updates and a completion flag each turn.
  - `POST /api/chat/message` and `GET /api/chat/greeting` added in `backend/app/routers/chat.py`.
- **PL-6** — Extended chat to all 11 catalog document types:
  - `backend/app/documents.py` — `UniversalDocFields` (Pydantic, covers all 11 doc types), `SUPPORTED_DOCS` registry with required fields / defaults / system prompt per type, `is_complete()` and `get_system_prompt()` dispatchers.
  - Two-phase conversation: AI first identifies the document type, then collects type-specific fields. If the user asks for an unsupported type, AI explains and suggests the closest match.
  - `frontend/components/GenericDocumentPreview.tsx` — Live fields-summary preview for all non-NDA document types; NDA continues to use `NDADocument`.
  - `frontend/components/PreviewPageClient.tsx` — Updated to support download/print for all document types.
  - `frontend/lib/types.ts` — `GenericDocFields` (TypeScript mirror of `UniversalDocFields`), `DOC_TYPE_NAMES`, `FIELD_LABELS`, `DocStoragePayload`.
  - UI fix: input focus reliably restored after each AI response via `useEffect` watching `sending`.
  - AI fix: system prompts now explicitly require a follow-on question whenever required fields are still missing.
  - 19 backend unit tests added in `backend/tests/`.

- **PL-7** — Authentication, per-user document persistence, and UI polish:
  - `backend/app/auth_utils.py` — `hash_password` / `verify_password` (bcrypt), `create_jwt` / `decode_jwt` (HS256, 7-day expiry via python-jose), `get_current_user` FastAPI dependency reading the `prelegal_session` HttpOnly cookie.
  - Auth routes fully implemented: signup persists user with bcrypt hash and issues JWT cookie; signin verifies password; `/me` decodes cookie and returns `{id, email}`.
  - `backend/app/routers/documents.py` — CRUD for saved documents: `GET /api/documents` (list), `POST /api/documents` (save), `GET /api/documents/{id}`, `DELETE /api/documents/{id}`; all require a valid session.
  - SQLite `documents` table: `id, user_id, document_type, fields_json, created_at, updated_at`.
  - `frontend/app/auth/page.tsx` — Sign In / Sign Up single page with tabs, inline error messages.
  - `frontend/app/documents/page.tsx` — "My Documents" grid: doc type, creation date, Open (→ print preview) and Delete buttons.
  - `NDAChat` auth guard on mount (redirects to `/auth` if unauthenticated), user email + Sign Out in header, "My Documents" nav link, auto-save when chat completes (fires once via `savedRef`).
  - Draft disclaimer amber banner added to `GenericDocumentPreview`, `NDADocument`, and `PreviewPageClient` (suppressed in print via `.no-print`).
  - Brand colors defined as CSS variables in `globals.css`; layout metadata updated.
  - 36 backend tests: 8 auth, 9 document API, 19 pre-existing — all pass. `tests/conftest.py` initialises a temp SQLite DB per test session.

### Planned
- No planned items — all features complete.

### Implemented API Endpoints
- `GET /api/health` — health check.
- `POST /api/auth/signup` — accepts `{email, password}`, hashes password with bcrypt, inserts user, issues `prelegal_session` JWT cookie; 409 if email already registered.
- `POST /api/auth/signin` — verifies password against stored hash, issues JWT cookie; 401 on mismatch.
- `POST /api/auth/signout` — clears the `prelegal_session` cookie.
- `GET /api/auth/me` — decodes JWT cookie, returns `{user: {id, email}}`; 401 if no/invalid cookie.
- `GET /api/chat/greeting` — returns the opening assistant message and an empty `UniversalDocFields` object.
- `POST /api/chat/message` — accepts `{messages, fields: UniversalDocFields}`, calls the LLM, returns `{reply, fields, complete}`. The `fields.documentType` field drives which system prompt is used.
- `GET /api/documents` — lists the authenticated user's saved documents (newest first).
- `POST /api/documents` — saves `{documentType, fields}` for the authenticated user; returns the created document with id and timestamps.
- `GET /api/documents/{id}` — returns a single document; 404 if not found or belongs to another user.
- `DELETE /api/documents/{id}` — deletes a document; 404 if not found or belongs to another user.
