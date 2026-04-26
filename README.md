# PNW Campus Map

Student-life campus map website for Purdue University Northwest. The repository is organized by team ownership so frontend, backend, database, QA, and DevOps/PM work can move independently with clear boundaries.

## Team Structure

```text
frontend/   React + TypeScript + Vite map UI
backend/    Python Flask API skeleton for campus data and resource lookup
database/   MySQL schema, seed data, and database documentation
docs/       Architecture, API contracts, onboarding, and ownership docs
docker/     Dockerfiles for app services
scripts/    Local setup, dev, and test helper scripts
```

## Run Locally

Frontend only:

```bash
npm install
npm run dev
```

These root npm commands delegate to `frontend/`. You can also run the same commands from inside `frontend/` directly.

Backend only:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app src.app:create_app run --host 0.0.0.0 --port 3000 --debug
```

## Run With Docker

Copy the example environment file, then start all services:

```bash
cp .env.example .env
docker compose up --build
```

Default service URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- MySQL: `localhost:3306`

## Validation

```bash
./scripts/test.sh
```

The current implemented app is the frontend campus map MVP. Backend and database folders contain starter structure and contracts for future integration.

## Folder Overview

- `frontend/src/app`: app shell and bootstrapping
- `frontend/src/components`: shared UI and map components
- `frontend/src/features`: feature work areas for home, map, and directory chat
- `frontend/src/services`: frontend API client code
- `backend/src/routes`: API route definitions
- `backend/src/controllers`: request handlers
- `backend/src/services`: backend business logic and data lookup
- `backend/src/integrations`: future map API and official school-resource integrations
- `database/schema`: SQL schema migrations or starter schema files
- `database/seed`: starter data for local development
- `docs`: team process and technical contracts
