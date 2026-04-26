# Backend

Python Flask API workspace for the campus map backend team.

## Owned By

Backend team owns API routes, controllers, services, server-side models, schemas, and integrations in this folder.

## Run Locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app src.app:create_app run --host 0.0.0.0 --port 3000 --debug
```

The API listens on `http://localhost:3000/api` by default.

## Current Endpoints

- `GET /health`
- `GET /api/health`
- `GET /api/locations`
- `GET /api/events`
- `GET /api/resources`
- `GET /api/resources/:slug`

These endpoints are starter contracts. They currently return small placeholder responses until the database integration is completed.
