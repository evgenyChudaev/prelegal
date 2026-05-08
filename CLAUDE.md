# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The prototype supports AI-chat-driven document drafting for all 11 supported document types. Authenticated per-user document persistence is planned (see *Implementation Status* below).

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
- **PL-3** — Next.js NDA creator prototype in `frontend/`: Mutual NDA form with live preview and client-side PDF download.
- **PL-4** — V1 technical foundation:
  - FastAPI backend in `backend/` (uv-managed, Python 3.12) serving the Next.js static export from the same origin on `:8000`.
  - SQLite `users` table created fresh on each container start (path: `/tmp/prelegal.db`).
  - Multi-stage Dockerfile (Node build → Python runtime).
  - `scripts/start-{mac,linux}.sh`, `scripts/start-windows.ps1`, and matching stop scripts. Override the host port with `PRELEGAL_PORT`.
  - Auth routes (`POST /api/auth/{signup,signin,signout}`, `GET /api/auth/me`) wired up as scaffolds — they validate input but don't yet persist or authenticate. PL-7 will replace them with bcrypt + JWT.
- **PL-5** — AI chat replaces the manual NDA form:
  - `NDAChat` React component (`frontend/components/NDAChat.tsx`) drives a conversational UI; sends message history + current fields to the backend each turn and updates the live NDA preview as fields are populated.
  - `backend/app/llm.py` calls `openrouter/openai/gpt-oss-120b` via LiteLLM with Cerebras as the inference provider, using structured outputs (`ChatLLMOutput`) to extract NDA field updates and a completion flag each turn.
  - `backend/app/nda.py` defines `NDAFields` (all optional during chat) and `is_complete()` which overrides the model's self-reported completion flag with a deterministic check.
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

### Planned
- **PL-7** — Real authentication (bcrypt + JWT HttpOnly cookies) and per-user document persistence (save / load / delete).

### Implemented API Endpoints
- `GET /api/health` — health check.
- `POST /api/auth/signup` — scaffold (PL-4). Accepts `{email, password}`, returns `{ok: true, email}`. PL-7 will persist with bcrypt and issue a JWT cookie.
- `POST /api/auth/signin` — scaffold (PL-4). Same shape as signup. PL-7 will verify against the users table.
- `POST /api/auth/signout` — clears the `prelegal_session` cookie.
- `GET /api/auth/me` — returns `{user: null}` until PL-7.
- `GET /api/chat/greeting` — returns the opening assistant message and an empty `UniversalDocFields` object.
- `POST /api/chat/message` — accepts `{messages, fields: UniversalDocFields}`, calls the LLM, returns `{reply, fields, complete}`. The `fields.documentType` field drives which system prompt is used.
