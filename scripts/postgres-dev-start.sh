#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA_DIR="$ROOT_DIR/.local/postgres-data"
PGLOG_FILE="$ROOT_DIR/.local/postgres-log/postgres.log"
PORT="${POSTGRES_PORT:-54329}"

if [ ! -f "$PGDATA_DIR/PG_VERSION" ]; then
  echo "Cluster not initialized. Run ./scripts/postgres-dev-init.sh first."
  exit 1
fi

pg_ctl -D "$PGDATA_DIR" -l "$PGLOG_FILE" start

if ! psql "postgresql://marusya@127.0.0.1:$PORT/postgres" -tAc "SELECT 1 FROM pg_database WHERE datname = 'marusya_ai'" | grep -q 1; then
  createdb -h 127.0.0.1 -p "$PORT" -U marusya marusya_ai
fi

echo "Postgres started on 127.0.0.1:$PORT"
echo "DATABASE_URL=postgresql://marusya@127.0.0.1:$PORT/marusya_ai"
