# LegalMind setup

Use this guide to run Phase 0 on your machine. When it works, the React page shows that Express can reach PostgreSQL and the FastAPI service.

The browser talks only to Express. Express checks the database and the AI service.

```text
React          http://localhost:5173
  |
  v
Express        http://localhost:4000
  |                 \
  v                  v
PostgreSQL        FastAPI
localhost:5432    http://localhost:8000
```

## What to install first

Install these and confirm each one starts:

- Git
- Docker Desktop, and leave it running
- Node.js 20 or newer, which includes npm
- Python 3.12 or newer

Check them in a terminal:

```bash
git --version
docker --version
node --version
npm --version
python3 --version
```

On Windows, `python --version` may be the command instead of `python3`.

## 1. Get the project

Clone the repository, then move into its root. The root is the folder that contains `docker-compose.yml`.

```bash
git clone <repository-url>
cd LegalMind
```

## 2. Create the environment files

Each app has a committed `.env.example`. Copy it to `.env` in the same folder. The `.env` files stay on your machine and are not committed.

```bash
cp ai-service/.env.example ai-service/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item ai-service\.env.example ai-service\.env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Leave the values as they are for a local setup:

- FastAPI listens on port `8000`.
- Express listens on port `4000` and connects to PostgreSQL and FastAPI.
- React calls Express at `http://localhost:4000`.

If you change `frontend/.env` after React is already running, stop React and start it again. Vite reads that file at startup.

## 3. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

The first run downloads the database image. Wait until the container is healthy:

```bash
docker compose ps
```

The `postgres` service should show `healthy`. The database name, user, and password are all `legalmind`.

## 4. Install dependencies

Run these once, from the project root.

AI service:

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

On Windows, create and activate the virtual environment with:

```powershell
cd ai-service
py -3 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

Express:

```bash
cd backend
npm install
cd ..
```

React:

```bash
cd frontend
npm install
cd ..
```

## 5. Run the services

Keep PostgreSQL running. Open three more terminals. Start FastAPI first, then Express, then React. Use the project root as the starting point in each terminal.

Terminal 1, FastAPI:

```bash
cd ai-service
source venv/bin/activate
python main.py
```

On Windows, activate with `venv\Scripts\activate` instead of `source venv/bin/activate`.

Leave this terminal open. You should see Uvicorn running on port `8000`. It starts two Python processes on purpose: one watches files, and the other serves requests. Both share port `8000`.

Terminal 2, Express:

```bash
cd backend
npm run dev
```

Leave this terminal open. You should see `Express listening on http://localhost:4000`.

Terminal 3, React:

```bash
cd frontend
npm run dev
```

Leave this terminal open. You should see a local address of `http://localhost:5173/`.

## 6. Open the check page

Open http://localhost:5173 in a browser.

The page title is LegalMind. Three rows should be green:

- **Express** means the browser reached the backend.
- **PostgreSQL** means Express ran `SELECT 1` against the database.
- **AI service** means Express reached FastAPI `GET /health`.

Click **Check again** to run the same checks once more.

You can also call Express directly:

```bash
curl http://localhost:4000/api/health
```

A healthy response has HTTP status 200 and `"status": "ok"` for both checks. If PostgreSQL or FastAPI is down, Express still responds, but with HTTP status 503 and `"status": "degraded"`. The failed check includes an error detail.

## Stop the services

Press `Ctrl+C` in the React, Express, and FastAPI terminals.

PostgreSQL keeps running in Docker. Stop it from the project root when you no longer need it:

```bash
docker compose stop
```

Start it again later with `docker compose up -d`. Your database data remains in the Docker volume.

## If a row is red

- **Express** is red when React cannot reach port `4000`. Confirm the backend terminal is still running and `frontend/.env` contains `VITE_API_URL=http://localhost:4000`. Restart React after changing that file.
- **PostgreSQL** is red when Docker is stopped or the container is not healthy. Run `docker compose ps` from the project root.
- **AI service** is red when FastAPI is not running. Confirm the first terminal shows Uvicorn on port `8000`.

A port already in use means another program is using `5173`, `4000`, `8000`, or `5432`. Stop that program, then start the LegalMind service again.
