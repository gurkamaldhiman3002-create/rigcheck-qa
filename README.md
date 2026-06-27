# RigCheck QA

RigCheck QA is a lightweight MVP for tracking custom gaming PC builds, inspecting them, and managing defects or rework.

## Overview

The application combines a FastAPI backend, an async SQLAlchemy/PostgreSQL data layer, and a Next.js frontend so technicians can manage inspections end to end.

## Architecture

- Backend: FastAPI + async SQLAlchemy + Psycopg + Alembic
- Frontend: Next.js + TypeScript + Tailwind CSS
- Database: PostgreSQL running through Docker Compose

## Major features

- Create, list, view, update, and delete computer builds
- Track inspection status for pending, passed, failed, or rework builds
- Record defects with severity, category, and status
- View a dashboard summary of inspection activity and open defects

## Technology stack

- Python 3.12+
- FastAPI
- SQLAlchemy 2.0
- Alembic
- PostgreSQL 17
- Next.js 16
- Tailwind CSS

## Local setup

1. Copy the root environment file if needed:
   - `copy .env.example .env` (or create the file manually)
2. Start PostgreSQL:
   - `docker compose up -d db`
3. Install backend dependencies:
   - `cd backend`
   - `pip install -r requirements.txt`
4. Run database migrations:
   - `alembic upgrade head`
5. Start the backend and frontend (helpers provided):

- Start everything (PostgreSQL, backend, frontend) in separate processes:

```powershell
# from project root
.\start-dev.ps1
```

- Stop services started by the helper script (will stop containers and processes started by `start-dev.ps1`):

```powershell
.\stop-dev.ps1
```

Alternatively start components individually:

- Start backend (from project root):

```powershell
cd backend
..\.venv\Scripts\python.exe run_server.py
```

- Start frontend (from project root):

```powershell
cd frontend
npm install
npm run dev
```

## Environment variables

Root `.env` values should include:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

Frontend `.env.local` can define:

- `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`

## Docker / PostgreSQL

- Compose file: `compose.yaml`
- PostgreSQL container: `rigcheck-postgres`
- Data volume: `rigcheck_postgres_data`

## Backend commands

- `cd backend`
- `python -m py_compile app/main.py app/database.py`
- `pytest -q tests/test_api.py`
- `alembic revision --autogenerate -m "message"`
- `alembic upgrade head`

## Frontend commands

- `cd frontend`
- `npm run lint`
- `npm run build`

## Testing

- Backend tests: `cd backend && pytest -q tests/test_api.py`

## API documentation

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Project structure

- `backend/app/` - FastAPI app, models, schemas, services, routes
- `backend/alembic/` - Alembic migrations
- `frontend/src/app/` - Next.js pages and routing
- `compose.yaml` - PostgreSQL container definition

## Future improvements

- Authentication and role-based access
- Attachments and photo evidence
- Advanced reporting and export workflows
