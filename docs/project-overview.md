# Project Overview: PNW Hammond Campus Map

## Project Title

PNW Hammond Campus Map

## Project Purpose

Provide a modern campus wayfinding and student-life application for Purdue University Northwest's Hammond campus.

## Problem Being Solved

Students, visitors, and staff need a single place to find campus locations, parking, accessibility points, student-life events, department resources, and directions. This project combines those workflows into one web application.

## Target Users

- Current students
- Prospective students and families
- Campus visitors
- Faculty and staff
- Event organizers and student-life staff

## Key Capabilities

- Searchable interactive campus map
- Layer/category filtering
- Feature details with route destination setup
- Route planner with current location, address, and map-click origins
- Events hub with event detail pages and registration workflow
- Department resource hub
- Campus assistant for routed questions and structured results
- Responsive desktop and mobile UI

## Architecture Summary

- `frontend/src/app`: top-level application view switching
- `frontend/src/components`: map, sidebar, details, header, and shared controls
- `frontend/src/pages`: auth, events, and campus assistant pages
- `frontend/src/services`: frontend API clients and fallback logic
- `frontend/src/state`: map and routing state
- `backend/src/routes`: Flask route modules
- `backend/src/controllers`: request handlers
- `backend/src/services`: backend business logic
- `backend/src/repositories`: MySQL data access
- `database/init` and `database/seed`: schema and seed data

## Run Locally

Full stack:

```bash
cp .env.example .env
docker compose up --build
```

Frontend only:

```bash
npm install
npm run dev
```

Backend only:

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m flask --app src.app:create_app run --host 0.0.0.0 --port 3000 --debug
```

## Validation

```bash
npm run build
cd backend
python -m pytest
```
