#!/usr/bin/env bash
set -euo pipefail

npm --prefix frontend install
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
