# DF Portal

Internal SaaS portal for managing projects and files.

## Stack
- Frontend: React, Vite, TS, Tailwind, Zustand, TanStack Query.
- Backend: NestJS, Prisma, PostgreSQL, Passport (JWT + OAuth).
- Storage: local filesystem under `/storage/<project>/<folder>`.
- Infra: Docker, Nginx reverse proxy.

## Quick start (local)
1. `npm install`
2. Backend env: copy `apps/backend/.env.example` to `.env` and set secrets.
3. `npm run dev:backend` (port 3000) and `npm run dev:frontend` (port 5173).
4. Run `npm --workspace apps/backend run prisma:migrate` to create schema.

## Docker
`docker compose -f docker/docker-compose.yml up -d --build`

## Migrations (inside container)
`docker compose -f docker/docker-compose.yml exec backend npx prisma migrate deploy`

## TLS
- Point DNS `A` record to VPS IP.
- Use certbot webroot at `/var/www/certbot`; copy certs to `/etc/letsencrypt` (already mounted in compose).
- Reload nginx container after issuing: `docker compose -f docker/docker-compose.yml exec nginx nginx -s reload`.

## VPS deployment checklist
1) Install Docker + docker-compose.
2) Clone repo, set `apps/backend/.env` (JWT_SECRET, OAuth keys, DATABASE_URL).
3) `docker compose -f docker/docker-compose.yml up -d --build`.
4) Run migrations and seed an admin user (via API or manual insert).
5) Set up cron for `certbot renew` and reload nginx on success.
