import { Pool } from "pg";

const DEFAULT_DATABASE_URL = "postgresql://marusya@127.0.0.1:54329/marusya_ai";

declare global {
  var __marusyaPgPool: Pool | undefined;
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
}

export function getPool() {
  if (!globalThis.__marusyaPgPool) {
    globalThis.__marusyaPgPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return globalThis.__marusyaPgPool;
}
