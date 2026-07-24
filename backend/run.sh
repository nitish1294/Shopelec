#!/usr/bin/env bash
# Start Postgres + Mongo (docker) then the API
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp -n .env.example .env
uvicorn app.main:app --reload --port 8000
