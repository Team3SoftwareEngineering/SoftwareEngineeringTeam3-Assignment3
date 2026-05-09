# Local Development

These steps assume Ubuntu or an Ubuntu-based development environment.

## Why Ubuntu Is The Baseline

Ubuntu is the default development baseline for this project because the setup scripts, shell commands, path examples, and Docker-first workflow are maintained and verified in Linux-style environments. Other operating systems can still run the project, but Ubuntu instructions are treated as the source of truth when troubleshooting team setup issues.

## Prerequisites

- Node.js 22 LTS
- npm
- Python 3.12
- pip and venv
- Docker Engine and Docker Compose plugin

## One-Time Setup

```bash
cp .env.example .env
./scripts/setup.sh
```

## Docker Compose Workflow

`docker compose up --build` orchestrates the full local stack from the repository root:

1. Builds frontend and backend images from `docker/frontend/Dockerfile` and `docker/backend/Dockerfile`.
2. Starts MySQL and initializes schema/seed files from `database/init` and `database/seed`.
3. Waits for MySQL health checks to pass before starting the backend (`depends_on` with `service_healthy`).
4. Starts the frontend after the backend container is available.

Use this path when you need consistent frontend + backend + database behavior and shared reproducibility across teammates.

## Run Without Docker

Start the frontend:

```bash
cd frontend
npm run dev
```

Start the backend in another terminal:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app src.app:create_app run --host 0.0.0.0 --port 3000 --debug
```

## Run With Docker

```bash
docker compose up --build
```

## When To Use Docker vs Non-Docker

- Use Docker when validating integrated behavior across frontend, backend, and MySQL, or when reproducing teammate/reviewer issues.
- Use non-Docker runs when iterating quickly on one workspace and you do not need full stack orchestration.
- Use hybrid mode (`docker compose up -d mysql` + local backend/frontend processes) when you want a managed MySQL instance with native local app debugging.

## Test

```bash
./scripts/test.sh
```

## Ports

- Frontend: `5173`
- Backend: `3000`
- MySQL: `3306`

## Troubleshooting Ports And Environment Variables

| Symptom | What to check |
| --- | --- |
| Frontend cannot reach backend API | Confirm `VITE_API_BASE_URL=http://localhost:3000/api` in `.env` and ensure backend is running on `3000`. |
| Backend cannot connect to database in Docker | Backend container should use `DB_HOST=mysql`; this is set by `docker-compose.yml`. |
| Backend cannot connect to database outside Docker | Use `DB_HOST=localhost` in `.env` for host-run backend processes. |
| Port 3306 already in use | Start with a different host mapping, for example `DB_PORT=3308 docker compose up --build`. |
| Frontend or backend port conflict | Override `FRONTEND_PORT` or `BACKEND_PORT` in `.env`, then restart compose. |
