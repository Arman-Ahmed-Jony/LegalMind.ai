# Phase 1: clients, cases, and documents

Phase 1 is the application without AI. A person signs in, manages clients and cases, and uploads PDF or DOCX files. Express stores the records in PostgreSQL and the file bytes on disk. FastAPI is not involved.

## Internal users and clients

An internal user is someone who works in the app. A client is a record about a person or company the firm represents. Clients do not have passwords and cannot sign in.

An internal user has one role:

- `admin` can create, edit, and delete internal users, and can use clients, cases, and documents.
- `member` can use clients, cases, and documents. The Users page and `/api/users` reject a member.

The migration inserts the first account: username `admin`, password `admin`, role `admin`. That password is for this local project only.

## Login

The password column stores a bcrypt hash, not the password. Login compares the typed password with that hash. On success, Express sets an httpOnly cookie named `legalmind_token`. JavaScript in the browser cannot read the cookie. React sends it automatically because each API call uses `credentials: 'include'`.

`GET /api/health` stays public, so the status check still works without a cookie. Every other `/api` route requires a signed-in user. Signing out clears the cookie.

A user cannot delete their own account. The last admin cannot be deleted or changed into a member.

## Tables

| Table | What it stores |
|---|---|
| `users` | Username, password hash, and role |
| `clients` | Name and optional notes |
| `cases` | Title, optional description, and the client it belongs to |
| `documents` | Original filename, stored filename, type, size, and the case it belongs to |

Deleting a client is rejected while that client still has cases. Deleting a case deletes its document rows. The database does not store the file contents.

## Files

Uploaded files are written to `backend/uploads/`. The `documents` row points at the stored filename. Download reads that file and sends it back with the original name. Only PDF and DOCX files are accepted, and a file must be 20 MB or smaller.

## Pages

| Path | Who can open it | What it does |
|---|---|---|
| `/login` | Anyone | Username and password |
| `/` | Signed-in user | Client list and create form |
| `/clients/:clientId` | Signed-in user | Edit the client and its cases |
| `/cases/:caseId` | Signed-in user | Edit the case and its documents |
| `/users` | Admin | Create, change role, and delete internal users |
| `/status` | Signed-in user | Phase 0 health check |

A private page sends a signed-out visitor back to `/login`.

## API

- `POST /api/login`, `POST /api/logout`, `GET /api/me`
- `GET /api/users`, `POST /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id`
- `GET /api/clients`, `POST /api/clients`, `GET /api/clients/:id`, `PATCH /api/clients/:id`, `DELETE /api/clients/:id`
- `POST /api/clients/:clientId/cases`
- `GET /api/cases/:id`, `PATCH /api/cases/:id`, `DELETE /api/cases/:id`
- `POST /api/cases/:caseId/documents`
- `GET /api/documents/:id/file`, `DELETE /api/documents/:id`

A bad body is HTTP 400. A missing row is HTTP 404. A delete that the rules forbid, such as removing a client who still has cases, is HTTP 409.

## Run this phase

Start PostgreSQL from the repository root, then apply the tables:

```bash
docker compose up -d
cd backend
npm run migrate
npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 and sign in as `admin` / `admin`.

`backend/.env` needs `AUTH_SECRET`. The example file uses `dev-only-change-me`.
