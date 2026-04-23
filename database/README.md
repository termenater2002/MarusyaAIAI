# Database Bootstrap

This folder contains the first PostgreSQL database layer for the project.

## What is covered

- `schema.sql`: PostgreSQL schema for AI tools, users, sessions, password recovery, favorites, and user ratings.
- `seed.sql`: generated PostgreSQL inserts from `../AIDATASET_deduped_items.json`.

## Data model choices

- `ai_tools` stores the canonical imported catalog records.
- `categories` stores the category IDs together with the category names you provided for IDs `1..16`.
- `user_ratings` stores user-submitted ratings separately from `editorial_rating` on `ai_tools`.
- `user_favorites` stores the many-to-many relation between users and tools.
- Auth-related data is split into `users`, `auth_sessions`, and `password_reset_tokens`.

## Regenerate seed data

```bash
cd /home/deck/Desktop/MarusyaAI/MarusyaAIAI-005-interactive-nav
export PATH="$PWD/.local/node-v22.22.2-linux-x64/bin:$PATH"
npm run db:seed:generate
```

## Local PostgreSQL defaults

- Database URL expected by the app:

```bash
postgresql://marusya@127.0.0.1:54329/marusya_ai
```

- By default this project reads it from `.env.local`.
- Override it there if you use another instance.

## Initialize local PostgreSQL cluster

```bash
cd /home/deck/Desktop/MarusyaAI/MarusyaAIAI-005-interactive-nav
./scripts/postgres-dev-init.sh
./scripts/postgres-dev-start.sh
```

## Validate connection

```bash
cd /home/deck/Desktop/MarusyaAI/MarusyaAIAI-005-interactive-nav
npm run db:init
```

## Create first local user

```bash
cd /home/deck/Desktop/MarusyaAI/MarusyaAIAI-005-interactive-nav
npm run db:user:create -- --email admin@marusya.local --password supersecret123 --username admin --display-name "Admin"
```

## Apply schema and seed to PostgreSQL manually

```bash
psql "postgresql://marusya@127.0.0.1:54329/marusya_ai" -f database/schema.sql
psql "postgresql://marusya@127.0.0.1:54329/marusya_ai" -f database/seed.sql
```

## Notes

- The schema is now Postgres-first.
- No demo users are seeded yet because login data should be created explicitly, not guessed from the dataset.

## Service checks

Run the HTTP checks:

```bash
npm run services:check
```

Import the latest JSON report into PostgreSQL:

```bash
npm run services:import
```

Import a specific report:

```bash
npm run services:import -- --file database/service-checks/service-checks-2026-04-22T22-01-02.179Z.json
```
