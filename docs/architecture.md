# LegalMind architecture

Phase 0 proves the process boundaries. Phase 1, documented in [phase-1.md](phase-1.md), adds sign-in, internal users, clients, cases, and document uploads. It still does not implement AI.

```text
React (Vite, port 5173)
        |
        |  GET /api/health
        v
Express (port 4000)
        |
        +-- SELECT 1 --------> PostgreSQL (port 5432)
        |
        +-- GET /health -----> FastAPI (port 8000)
```

The browser talks only to Express. FastAPI has no CORS middleware because the UI must not call it directly.

## Responsibilities

| Piece | Owns now | Owns later |
|---|---|---|
| React | Sign-in, clients, cases, documents, and the status page | Chat and AI results |
| Express | Health, auth, and the public REST API | Calls into FastAPI for AI work |
| PostgreSQL | Users, clients, cases, and document metadata | Embeddings |
| FastAPI | `GET /health` | Document processing, embeddings, RAG, LangChain |

One PostgreSQL database is shared by the project. Express is the only process that connects to it. The vector extension is not created yet. See [phase-1.md](phase-1.md) for the tables and login flow.

## Run Phase 0

From the repository root, start the database:

```bash
docker compose up -d
```

Then start each app in its own terminal:

```bash
cd ai-service
source venv/bin/activate
python main.py
```

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Open http://localhost:5173. Express health is also available at http://localhost:4000/api/health.

Environment templates live in each app as `.env.example`. Copy one to `.env` in the same directory before starting that app. The local `.env` files are not committed.

## Health response

`GET /api/health` returns HTTP 200 only when both checks pass. If PostgreSQL or FastAPI fails, the response is HTTP 503 and the failing check includes an error detail. A down dependency is never reported as healthy.
