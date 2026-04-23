import path from "node:path";
import fs from "node:fs";

import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL || "postgresql://marusya@127.0.0.1:54329/marusya_ai";
const repoRoot = process.cwd();
const schemaPath = path.join(repoRoot, "database", "schema.sql");
const seedPath = path.join(repoRoot, "database", "seed.sql");

const client = new Client({
  connectionString: databaseUrl,
});

await client.connect();

try {
  await client.query(fs.readFileSync(schemaPath, "utf8"));
  const countResult = await client.query("SELECT COUNT(*)::text AS count FROM ai_tools");
  const toolCount = Number(countResult.rows[0]?.count ?? 0);

  if (toolCount === 0) {
    await client.query(fs.readFileSync(seedPath, "utf8"));
  }

  const finalCountResult = await client.query("SELECT COUNT(*)::text AS count FROM ai_tools");

  console.log(`Database initialized: ${databaseUrl}`);
  console.log(`AI tools: ${finalCountResult.rows[0]?.count ?? "0"}`);
} finally {
  await client.end();
}
