# Architecture

## Overview

The project is split into frontend, backend, and database workspaces with Docker orchestration at the repository root.

## Frontend

`frontend/` contains the existing React + TypeScript + Vite campus map MVP. It currently renders local demo campus data and supports map search, category filtering, feature selection, and responsive map controls.

Expected feature areas:
- `frontend/src/features/home`
- `frontend/src/features/map`
- `frontend/src/features/directory-chat`

## Backend

`backend/` contains a Python Flask API skeleton. It exposes starter endpoints under `/api` and defines clear folders for routes, controllers, services, models, schemas, utilities, and external integrations.

Expected responsibilities:
- Serve campus location, parking, event, registration, and resource-link data
- Provide resource lookup or redirect behavior for official PNW pages
- Integrate with map APIs and routing APIs later
- Read and write MySQL data once the database contract stabilizes

## Database

`database/` contains MySQL schema and seed files. Docker uses the official MySQL image and mounts schema/seed SQL files for first-run initialization.

Core entities:
- Students
- Events
- Registrations
- Buildings and campus locations
- Parking lots
- Official resource links

## External Integrations

Future external integrations should be isolated under `backend/src/integrations` so API routes do not depend directly on vendor SDKs or third-party response formats.
