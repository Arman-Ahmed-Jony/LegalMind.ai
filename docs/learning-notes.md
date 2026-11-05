# Phase 0 learning notes

## What is running

Four processes, each with one job:

1. React draws the page and requests JSON from Express.
2. Express is the only API the browser is allowed to call.
3. PostgreSQL answers `SELECT 1`, which proves the network connection and the login.
4. FastAPI answers `GET /health`, which proves Express can reach the AI service.

Nothing in this phase reads a document or calls a model.

## What happens when the page loads

1. The browser loads JavaScript from Vite on port 5173.
2. That JavaScript calls `http://localhost:4000/api/health`.
3. Express asks PostgreSQL for `SELECT 1` and, at the same time, calls `http://localhost:8000/health`.
4. Express returns one JSON object with a result for each check.
5. React prints those results. It does not open its own connection to PostgreSQL or FastAPI.

The two checks run together with `Promise.all`, so a slow database does not hide an AI-service failure, and the reverse is also true.

## Why the AI service is separate

Express is a good place for application APIs. Python is a better place for the document and model libraries this project will use later: PyMuPDF, LangChain, and RAGAS. Keeping that work behind FastAPI means the UI and the business API do not take on those libraries.

## What is intentionally missing

- Clients, cases, and file uploads. Those are Phase 1.
- OpenAI. That is Phase 2, and the first version will call the API directly.
- Text extraction, chunking, and embeddings. Those are Phases 3 to 5.
- LangChain. That is Phase 7, after a manual RAG pipeline exists.
- Redis and BullMQ. Those arrive with real background jobs.

## Exercise

Stop the FastAPI process and click **Check again**. Express and PostgreSQL should stay healthy, and the AI service row should show an error. Start FastAPI again and the row should recover.

Then stop the Postgres container with `docker compose stop` and check again. Only the PostgreSQL row should fail. Start it with `docker compose start`.
