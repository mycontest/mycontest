# MyContest API Server

Express.js API for the MyContest platform with MySQL, PM2 runtime, and docker-compose tooling.

## What’s Inside

- `app.js` / `server.js` – Express bootstrap and entry point.
- `modules/` – Auth, problems, contests, discussions, notifications.
- `database/migrations/` – `init.sql` schema and `seed.sql` demo data.
- `database/scripts/` – `run-sql.js`, `deploy-db.js`, `backup.js` helpers.
- `docker-compose.yml`, `Dockerfile`, `ecosystem.config.js` – container + PM2 config.
- `storage/test_cases/` – bundled sample test cases (kept under `server/storage`).
- `data/backups/` – timestamped DB + storage backups.

## Setup

1. `cp .env.example .env` and fill values (single source of truth).
2. `npm install`
3. `npm run db:deploy` (waits for MySQL, runs init + seed)
4. `npm run dev` for local dev or `npm run start:pm2` for clustered runtime.

## Docker / PM2

- `cd server && docker compose up -d` brings up `mysql`, `api` (pm2-runtime), and a `compiler` helper container with storage mounted at `/workspace/storage`.
- API is exposed on `${PORT:-5000}`; MySQL on `${DB_PORT:-3306}`.
- Update `.env` only here; compose reads from it and overrides `DB_HOST` to `mysql` inside containers.

## Database & Backups

- `npm run db:init` / `npm run db:seed` to run individual files.
- `npm run db:deploy` to run both with a readiness check.
- `npm run db:backup` dumps the database and copies `storage/` into `data/backups/<timestamp>/`.

## Naming

- Tables, columns, and file paths use `snake_case`.
- Functions and handlers use `camelCase`.
