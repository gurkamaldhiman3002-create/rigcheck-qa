# RigCheck QA

RigCheck QA tracks PC build inspections, defects, and QA workflows with role-based access control.

## Production architecture

- Frontend: Next.js (Vercel)
- Backend: FastAPI + SQLAlchemy + Alembic (Railway)
- Database: PostgreSQL (Railway service)
- CI: GitHub Actions

## Local development setup

1. Create local environment config from [.env.example](.env.example).
2. Start local PostgreSQL:

```powershell
docker compose up -d db
```

3. Install backend dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

4. Apply migrations:

```powershell
alembic upgrade head
```

5. Install frontend dependencies:

```powershell
cd ../frontend
npm install
```

6. Start everything from project root:

```powershell
.\start-dev.ps1
```

Stop local services:

```powershell
.\stop-dev.ps1
```

## Backend environment variables

Set these on Railway for production and in local `.env` for development.

- `DATABASE_URL` (production preferred; takes precedence over individual PostgreSQL vars)
- `POSTGRES_DB` (local fallback)
- `POSTGRES_USER` (local fallback)
- `POSTGRES_PASSWORD` (local fallback)
- `POSTGRES_HOST` (local fallback, usually `localhost`)
- `POSTGRES_PORT` (local fallback, usually `5432`)
- `PORT` (set by Railway automatically)
- `FRONTEND_URL` (fallback CORS origin when explicit list is not set)
- `CORS_ALLOWED_ORIGINS` (comma-separated explicit origins)
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM` (for example `HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `COOKIE_SECURE`
- `COOKIE_SAMESITE`

## Frontend environment variables

Set in Vercel project settings.

- `NEXT_PUBLIC_API_URL` (Railway backend public URL)

Local example is provided in [frontend/.env.example](frontend/.env.example).

## CORS and cookie configuration

- CORS uses explicit allow-list origins only.
- Credentialed requests are enabled (`allow_credentials=True`).
- Wildcard origins are rejected for credentialed CORS.
- Authentication cookie is HTTP-only.
- Local defaults: `COOKIE_SECURE=false`, `COOKIE_SAMESITE=lax`.
- Production recommendation: `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none`.

## Railway backend setup

1. Create a Railway project.
2. Add a PostgreSQL service in the same project.
3. Add backend service from this repo and set root directory to `backend`.
4. Configure all required environment variables.
5. Use Dockerfile deploy (auto-detected from [backend/Dockerfile](backend/Dockerfile)).
6. Ensure health check path is `/health`.

Container startup command is defined in [backend/Dockerfile](backend/Dockerfile):

- Runs `alembic upgrade head`
- Starts `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`

## Railway PostgreSQL setup

1. Provision PostgreSQL service.
2. Copy the internal/private connection URL into backend `DATABASE_URL`.
3. Keep SSL/connectivity settings as required by Railway defaults.
4. Do not expose credentials in source control.

## Vercel frontend setup

1. Create/import Vercel project from this repository.
2. Set root directory to `frontend`.
3. Configure environment variable `NEXT_PUBLIC_API_URL` to the Railway backend URL.
4. Build command: `npm run build`.
5. Output mode: Next.js default.

## CI/CD (GitHub Actions)

Workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)

Triggers:

- Push to `main`
- Pull request targeting `main`

Backend CI job:

- Starts PostgreSQL service container
- Installs backend dependencies
- Runs Alembic migrations
- Runs Python compilation checks
- Runs full pytest suite

Frontend CI job:

- Uses `npm ci`
- Runs ESLint
- Runs production Next.js build

Both jobs use safe CI-only credentials and dependency caching.

## Useful commands

Backend:

```powershell
cd backend
alembic upgrade head
python -m compileall app
pytest -q
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Docker/compose validation:

```powershell
docker compose config -q
docker build -t rigcheck-backend-test -f backend/Dockerfile backend
```

## Post-deployment verification checklist

- Backend health endpoint returns healthy: `GET /health`
- Frontend can log in through cookie-based auth
- `/api/auth/me` returns signed-in user from Vercel origin
- Logout invalidates session cookie
- CORS allows only configured frontend origins
- Technician cannot manage users or delete builds
- Supervisor can delete builds/defects but cannot manage users
- Admin can create/edit/deactivate/reactivate users
- Inactive users cannot log in

## API docs in development

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
