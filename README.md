# PNW Hammond Campus Map & Event Handler

A full-stack campus wayfinding and student-life web application for Purdue University Northwest's Hammond campus. The system combines an interactive map, campus event discovery, event registration, department resources, parking/location lookup, route planning, and a campus assistant workflow.

## Project Summary

This repository is organized as a monorepo with three main application layers:

- `frontend`: React, TypeScript, Vite, Tailwind CSS, Leaflet map UI, event pages, route planner, and campus assistant UI.
- `backend`: Flask API that exposes events, registrations, locations, parking, map features, resources, routing, and chat query endpoints.
- `database`: MySQL schema and seed files used by Docker and deployment environments.

The app is designed so the frontend can run with backend data when the API is available and use curated local fallback data for map and resource continuity when a service is unavailable.

## Core Features

- Interactive Hammond campus map with searchable buildings, parking, accessibility points, emergency resources, community resources, and student-life areas.
- Layer controls for showing and hiding campus feature categories.
- Feature detail panel with location metadata and one-click route destination setup.
- Route planner with current location, typed address, and map-click origin support.
- Walking/driving routing through OpenStreetMap-based providers and backend route service support.
- Events hub with event search, category filters, event detail pages, location preview maps, and registration counts.
- Duplicate event registration protection for signed-in users and guest sessions.
- Department resource hub backed by API data with frontend fallback links.
- Campus assistant that routes user questions to events, locations, parking, registrations, and resource lookup responses.
- Responsive desktop and mobile layouts.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Leaflet, Zustand, Fuse.js |
| Backend | Python, Flask, Flask-CORS, mysql-connector-python, pytest, gunicorn |
| Database | MySQL 8.4, schema SQL, seed SQL |
| DevOps | Docker Compose, Dockerfiles, Render-compatible service layout |

## Repository Structure

```text
.
├── backend/                 Flask API source, tests, requirements, backend README
│   └── src/
│       ├── app/             Flask application factory
│       ├── config/          Environment and database config
│       ├── controllers/     Request handler logic
│       ├── repositories/    MySQL data access layer
│       ├── routes/          API route registration
│       ├── services/        Business logic and query routing
│       ├── tests/           Backend unit/API tests
│       └── utils/           Validation, error, and geo helpers
├── database/
│   ├── init/                MySQL schema initialization files
│   └── seed/                Local and deployment seed data
├── docker/                  Frontend and backend Dockerfiles
├── docs/                    Architecture, API contracts, local development notes
├── frontend/                React application source and frontend README
│   └── src/
│       ├── app/             Application shell and top-level view routing
│       ├── components/      Shared UI, sidebar, map, details, and controls
│       ├── data/            Curated Hammond data and assistant prompt metadata
│       ├── models/          TypeScript domain types
│       ├── pages/           Auth, events, and assistant pages
│       ├── services/        API clients and frontend service logic
│       ├── state/           Zustand map/application state
│       ├── styles/          Tailwind global styles and tokens
│       └── utils/           Search, filters, and map helpers
├── scripts/                 Setup, development, and validation scripts
├── docker-compose.yml       Full local stack orchestration
├── package.json             Root frontend command delegation
└── README.md                Main project handoff guide
```

## How The Application Works

1. The user opens the frontend at `http://localhost:5173`.
2. `frontend/src/app/App.tsx` manages top-level views: auth, events, map, and campus assistant.
3. Map state lives in `frontend/src/state/useMapStore.ts`, including selected features, route origin/destination, sidebar state, and active map categories.
4. The frontend service layer calls the backend through `VITE_API_BASE_URL`, defaulting to `http://localhost:3000/api`.
5. The Flask backend registers all API modules under `/api` from `backend/src/routes/__init__.py`.
6. Backend controllers call service classes, services call repositories, and repositories read/write MySQL tables.
7. Docker Compose starts MySQL first, runs schema/seed SQL files, then starts the backend and frontend services.
8. When the API is unavailable, selected frontend areas use curated local fallback data so the map, resources, and events page remain usable for development and review.

## Prerequisites

Install these before running locally:

- Node.js 22 LTS or compatible current LTS
- npm
- Python 3.12+
- Docker Desktop or Docker Engine with Docker Compose
- Git

## Environment Setup

Create a local environment file from the example:

```bash
cp .env.example .env
```

Windows PowerShell equivalent:

```powershell
Copy-Item .env.example .env
```

Default local environment values:

```env
FRONTEND_PORT=5173
BACKEND_PORT=3000
VITE_API_BASE_URL=http://localhost:3000/api
DB_HOST=localhost
DB_PORT=3306
DB_NAME=student_life_db
DB_USER=pnw_app
DB_PASSWORD=change_me
DB_ROOT_PASSWORD=change_root_password
MAP_API_KEY=
VITE_MAP_API_KEY=
```

Important environment notes:

- Do not commit `.env` or real secrets.
- Use `DB_HOST=localhost` when running the backend directly on your machine.
- Use `DB_HOST=mysql` only inside Docker networking.
- `VITE_API_BASE_URL` must point to the backend `/api` URL.

## Running The Project

### Option 1: Full Stack With Docker

This is the easiest way to run the complete frontend, backend, and MySQL stack.

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:3000/health`
- API health: `http://localhost:3000/api/health`
- MySQL: `localhost:3306`

If MySQL port `3306` is already in use:

```bash
DB_PORT=3308 docker compose up --build
```

### Option 2: Frontend Only

Use this when you only need UI work. API-backed features will use fallback behavior where available.

```bash
npm install
npm run dev
```

Root scripts delegate into `frontend/`. You can also run the same commands directly inside `frontend/`.

### Option 3: Backend Locally With Docker MySQL

Start MySQL:

```bash
docker compose up -d mysql
```

Start the backend on Linux/macOS:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m flask --app src.app:create_app run --host 0.0.0.0 --port 3000 --debug
```

Start the backend on Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m flask --app src.app:create_app run --host 0.0.0.0 --port 3000 --debug
```

### Option 4: Frontend And Backend In Separate Terminals

Terminal 1:

```bash
npm run frontend:dev
```

Terminal 2:

```bash
cd backend
python -m flask --app src.app:create_app run --host 0.0.0.0 --port 3000 --debug
```

## Main User Flows

### Campus Map

1. Open the map from the navigation widget.
2. Search for a building, parking lot, accessibility point, or campus service.
3. Toggle layer categories from the sidebar.
4. Click a map feature to open details.
5. Select `Directions to this location` to prefill the route destination.
6. Choose current location, typed address, or map-click origin, then calculate the route.

### Events

1. Open the events page.
2. Search by event name, department, location, or category.
3. Open event details from the event card.
4. Review start/end time, location, cost, department, registration count, and full description.
5. Join the event once per signed-in account or guest session.
6. Use `Directions to this event` to open the map with the event location prefilled in the route planner.

### Campus Assistant

1. Open the campus assistant page.
2. Ask about events, parking, locations, registration, or campus resources.
3. The assistant classifies the request through the backend chat route.
4. The UI renders structured response cards with actions such as open details, view on map, directions, or resource links.

## API Overview

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `GET` | `/events` | List campus events in date order |
| `GET` | `/events/:event_id` | Read one event |
| `POST` | `/events/:event_id/registrations` | Register a student for an event |
| `GET` | `/locations` | List campus locations |
| `GET` | `/locations/:location_id/parking` | Parking near a location |
| `GET` | `/map-features` | Map feature data for frontend layers |
| `GET` | `/parking-lots` | Parking lot data |
| `GET` | `/resources` | Department/resource links |
| `GET` | `/resources/:slug` | One resource link entry |
| `POST` | `/routes` | Route calculation request |
| `POST` | `/chat/query` | Campus assistant query classification |

## Database

Docker initializes MySQL using these files:

```text
database/init/01_schema.sql
database/seed/seed.sql
database/seed/03_map_features.sql
```

The schema covers:

- students and accounts
- events
- registrations
- campus locations
- parking lots
- map features
- resource links

Railway-specific SQL files are kept in the same folders for deployment workflows that need separate import files.

## Validation

Run frontend checks from the repository root:

```bash
npm run lint
npm run test
npm run build
```

Run backend tests:

```bash
cd backend
python -m pytest
```

Run the combined script on Unix-like shells:

```bash
./scripts/test.sh
```

Expected build note: Vite may warn that the generated JavaScript chunk is larger than 500 KB. That warning does not fail the build.

## Deployment Notes For Render

Create services in this order:

1. MySQL-compatible database service or private MySQL service.
2. Backend web service.
3. Frontend static site.

Backend Render settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn "src.app:create_app()" --bind 0.0.0.0:$PORT
```

Backend environment variables:

```env
DB_HOST=<render-mysql-internal-host>
DB_PORT=3306
DB_NAME=student_life_db
DB_USER=pnw_app
DB_PASSWORD=<database-password>
MAP_API_KEY=
```

Frontend Render settings:

```text
Root Directory: frontend
Build Command: npm ci && npm run build
Publish Directory: dist
```

Frontend environment variable:

```env
VITE_API_BASE_URL=https://<backend-service>.onrender.com/api
```

Static site rewrite rule:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

## Submission Checklist

Before turning in the project:

1. Confirm `.env` contains only local values and is not committed.
2. Run `npm run build` from the repository root.
3. Run backend tests with `python -m pytest` from `backend/`.
4. Start the Docker stack and confirm `http://localhost:5173` loads.
5. Confirm `http://localhost:3000/api/health` returns `{ "status": "ok" }`.
6. Verify the events page loads, event details open, and duplicate joins are blocked.
7. Verify map search, layer toggles, feature details, and route planner behavior.
8. Check `git status --short` and review all intended files before submitting.

## Repository Hygiene

The following generated or local-only files are intentionally ignored:

- `.env` and `.env.*`
- `node_modules/`
- `.venv/`
- `dist/`
- coverage output
- Python `__pycache__/` and `.pyc` files
- pytest cache output
- local IDE metadata

Do not commit real credentials, local virtual environments, dependency folders, generated builds, or local database volumes.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Frontend cannot reach API | Check `VITE_API_BASE_URL` and confirm backend is running on port `3000`. |
| Backend cannot connect to MySQL locally | Use `DB_HOST=localhost` outside Docker. Use `DB_HOST=mysql` only inside Docker Compose. |
| MySQL port is busy | Run `DB_PORT=3308 docker compose up --build` or stop the process using port `3306`. |
| Event/resource data falls back locally | Confirm backend health and database seed import. |
| Route request fails | Check internet access for routing provider fallback and verify origin/destination are set. |

## Team Handoff Notes

- Root commands are optimized for frontend validation because the frontend is the main user-facing application.
- Backend tests live under `backend/src/tests` and are run separately with `pytest`.
- API contracts and architecture notes live in `docs/`.
- Database schema changes should be made in `database/init/01_schema.sql` and reflected in repository classes under `backend/src/repositories`.

## Contributors

- Copilot Task Agent — Documentation (Ubuntu + Docker development and architecture docs)
