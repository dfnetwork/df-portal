#!/usr/bin/env bash
# Deployment script for DF Portal. Intended to be run via CI (GitHub Actions) over SSH.
# Requirements on VPS: repo checked out at /opt/df-portal, Docker + compose plugin installed.
set -euo pipefail

REPO_DIR=${REPO_DIR:-/opt/df-portal}
COMPOSE_FILE=${COMPOSE_FILE:-docker/docker-compose.yml}

echo ">>> Switching to repo"
cd "$REPO_DIR"

echo ">>> Pulling latest code"
git fetch origin
git reset --hard origin/main

echo ">>> Building images"
docker compose -f "$COMPOSE_FILE" build

echo ">>> Applying migrations"
docker compose -f "$COMPOSE_FILE" up -d db
docker compose -f "$COMPOSE_FILE" run --rm backend npx prisma migrate deploy

echo ">>> Starting services"
docker compose -f "$COMPOSE_FILE" up -d

echo ">>> Cleaning old images"
docker image prune -f >/dev/null 2>&1 || true

echo "Deployment completed."
