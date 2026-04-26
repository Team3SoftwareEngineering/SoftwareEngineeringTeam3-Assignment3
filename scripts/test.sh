#!/usr/bin/env bash
set -euo pipefail

npm --prefix frontend run lint
npm --prefix frontend run test
npm --prefix frontend run build
(cd backend && .venv/bin/python -m pytest)
