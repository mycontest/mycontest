# MyContest v2.0

Full-stack coding contest platform with an Express API and Next.js front-end.

## Project Layout
- `server/` – API, database migrations, docker-compose/PM2 runtime, storage, backups.
- `web/` – Next.js app router UI.

## Environment
- Use a single env file at `server/.env` (sample: `server/.env.example`); docker-compose and scripts read only from here.
- For docker-compose, `DB_HOST` is overridden to `mysql`; for host development it defaults to `127.0.0.1`.

## Database
- Install deps: `cd server && npm install`.
- Initialize + seed: `npm run db:deploy` (or `npm run db:init` / `npm run db:seed` separately).
- Back up DB + storage: `npm run db:backup` (writes timestamped dumps to `server/data/backups/`).

## Running the Stack
- Local API dev: `cd server && npm run dev` (http://localhost:5000).
- Docker + PM2: `cd server && docker compose up -d` (brings up MySQL, API via pm2-runtime, and a compiler helper container).
- Front-end dev: `cd web && npm install && npm run dev` (`web/.env.local` should point at the API, defaults to http://localhost:5000/api/v1).

## Storage & Naming
- Test cases live in `server/storage/test_cases`; backups land in `server/data/backups`.
- Database tables/columns and file paths stay in `snake_case`; functions stay `camelCase`.

## Key Scripts
- `npm run dev` / `npm run start:pm2` – API dev/prod entry points.
- `npm run db:init`, `npm run db:seed`, `npm run db:deploy`, `npm run db:backup` – database lifecycle helpers.
