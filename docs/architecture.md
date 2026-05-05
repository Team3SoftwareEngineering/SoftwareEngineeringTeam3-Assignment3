# Architecture

## Overview

The project is a full-stack campus wayfinding application split into frontend, backend, and database workspaces. Docker Compose can run the complete local stack, while each workspace can also be developed independently.

## Frontend

`frontend/` contains the React + TypeScript + Vite application. It owns the interactive map, event pages, campus assistant UI, routing panel, authentication screens, and resource hub.

Primary responsibilities:

- Render campus map features from backend or curated local fallback data.
- Maintain map, routing, sidebar, and detail-panel state through Zustand.
- Search campus features and events with responsive UI feedback.
- Call backend endpoints through the frontend service layer.
- Preserve a usable local-development experience when optional services are offline.

## Backend

`backend/` contains the Flask API. It uses route modules, controllers, services, and repositories to keep request handling separate from business logic and database access.

Primary responsibilities:

- Serve events, registrations, map features, locations, parking, resources, routes, and chat query classifications.
- Validate request parameters and return consistent API responses.
- Read and write MySQL records through repository classes.
- Keep third-party or external integration code isolated under `backend/src/integrations`.

## Database

`database/` contains the MySQL schema and seed files used for local Docker startup and deployment imports.

Core entities:

- students
- events
- registrations
- campus locations
- parking lots
- map features
- resource links

## Request Flow

```text
Browser
  -> React page/component
  -> frontend service function
  -> Flask route
  -> controller
  -> service
  -> repository
  -> MySQL
```

For map and resource continuity, the frontend can fall back to curated local data when the backend is unreachable.

## Deployment Shape

A production-style deployment uses three services:

- Frontend static site built from `frontend/dist`
- Backend Flask web service served by gunicorn
- MySQL database initialized with schema and seed data
