# Local Development

These steps assume Ubuntu or an Ubuntu-based development environment.

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

## Test

```bash
./scripts/test.sh
```

## Ports

- Frontend: `5173`
- Backend: `3000`
- MySQL: `3306`
