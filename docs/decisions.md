# Architectural decisions

## Express.js is the main backend

React calls Express. Express calls FastAPI when AI work is required. Business rules, document metadata, and the public API stay in Express. AI processing stays in Python.

LangChain.js is not used. LangChain, when it is introduced in Phase 7, lives in the Python service.

## One PostgreSQL database, started with the pgvector image

Docker Compose runs `pgvector/pgvector:pg16` because the machine has Docker and does not have a local `psql`. The image is the same database Phase 5 will use for embeddings.

Phase 0 does not run `CREATE EXTENSION vector` and does not create tables. Enabling the extension now would skip the lesson on why embeddings need it.

There is no ORM. The `pg` driver runs `SELECT 1` so the connection itself is visible. Migrations start in Phase 1.

## Three separate apps

The repository holds `frontend`, `backend`, and `ai-service`. They are not an npm workspace and they do not share a package. Each app has its own dependencies and environment file.

## HTTP between Express and FastAPI

Express calls `AI_SERVICE_URL/health` with Node's `fetch`. There is no queue and no shared library. Redis and BullMQ wait until a phase has real background work.

## Secrets stay local

`.env` files are gitignored. `.env.example` files are committed and contain only local development values. No OpenAI key is configured in Phase 0.

## Python 3.14 for the AI service

The service uses a virtual environment and `requirements.txt`. Phase 0 installs FastAPI, Uvicorn, and python-dotenv. If a later library has no wheel for this interpreter, the service will move to Python 3.12 at that point.
