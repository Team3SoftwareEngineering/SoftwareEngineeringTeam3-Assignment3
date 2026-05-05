# Backend

Python Flask API workspace for the campus map backend team.

## Owned By

Backend team owns API routes, controllers, services, server-side models, schemas, and integrations in this folder.

## Run Locally

Linux / macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m flask --app src.app:create_app run --host 0.0.0.0 --port 3000 --debug
```

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m flask --app src.app:create_app run --host 0.0.0.0 --port 3000 --debug
```

The API listens on `http://localhost:3000/api` by default.

Default DB configuration:
- `DB_NAME=student_life_db`
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_USER=pnw_app`
- `DB_PASSWORD=change_me`

Important:
- `DB_HOST=mysql` only works inside Docker networking.
- When running backend directly on your machine, keep `DB_HOST=localhost`.

## Run With Docker MySQL

From repository root:

```bash
cp .env.example .env
docker compose up -d mysql
```

If `3306` is unavailable:

```bash
DB_PORT=3308 docker compose up -d mysql
```

## Current Endpoints

- `GET /health`
- `GET /api/health`
- `GET /api/events`
- `GET /api/events/:event_id`
- `POST /api/events/:event_id/registrations`
- `GET /api/locations`
- `GET /api/locations/:location_id/parking`
- `GET /api/parking-lots`
- `POST /api/routes`
- `GET /api/resources`
- `GET /api/resources/:slug`
- `POST /api/chat/query`

## Integration Steps Applied

1. Connected repositories to live MySQL schema tables (`events`, `students`, `registrations`, `campus_locations`, `parking_lots`, `resource_links`).
2. Added event list ordering by event date ascending and event registration count projection.
3. Mapped student registration to schema keys (`student_id` -> `student_uuid`) and preserved duplicate-registration protection.
4. Updated route parameter parsing to support alphanumeric IDs (`E9000`, `L100`) with numeric fallback.
5. Aligned Docker and environment defaults with the real DB name and SQL init/seed file paths.

## Verification

```bash
python -m pytest
python -m compileall src
```
