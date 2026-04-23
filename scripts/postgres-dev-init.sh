#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA_DIR="$ROOT_DIR/.local/postgres-data"
PGLOG_DIR="$ROOT_DIR/.local/postgres-log"
PGSOCKET_DIR="$ROOT_DIR/.local/postgres-socket"
PORT="${POSTGRES_PORT:-54329}"

mkdir -p "$ROOT_DIR/.local" "$PGLOG_DIR" "$PGSOCKET_DIR"

if [ ! -f "$PGDATA_DIR/PG_VERSION" ]; then
  initdb -D "$PGDATA_DIR" --username=marusya --auth=trust >/dev/null
fi

if ! grep -q "port = $PORT" "$PGDATA_DIR/postgresql.conf"; then
  cat >>"$PGDATA_DIR/postgresql.conf" <<EOF
port = $PORT
listen_addresses = '127.0.0.1'
unix_socket_directories = '$PGSOCKET_DIR'
EOF
fi

if ! grep -q "127.0.0.1/32" "$PGDATA_DIR/pg_hba.conf"; then
  cat >>"$PGDATA_DIR/pg_hba.conf" <<'EOF'
host all all 127.0.0.1/32 trust
host all all ::1/128 trust
EOF
fi

echo "Postgres cluster ready at $PGDATA_DIR"
echo "Start with: $ROOT_DIR/scripts/postgres-dev-start.sh"
