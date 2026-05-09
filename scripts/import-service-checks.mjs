import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { Client } from "pg";

const repoRoot = process.cwd();
const reportsDir = path.join(repoRoot, "database", "service-checks");
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://marusya@127.0.0.1:54329/marusya_ai";

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function getLatestReportFile() {
  const entries = fs
    .readdirSync(reportsDir)
    .filter((name) => name.startsWith("service-checks-") && name.endsWith(".json"))
    .map((name) => ({
      name,
      path: path.join(reportsDir, name),
      mtimeMs: fs.statSync(path.join(reportsDir, name)).mtimeMs,
    }))
    .sort((left, right) => right.mtimeMs - left.mtimeMs);

  return entries[0]?.path ?? null;
}

const explicitFile = readArg("--file");
const sourceFilePath = explicitFile
  ? path.resolve(repoRoot, explicitFile)
  : getLatestReportFile();

if (!sourceFilePath || !fs.existsSync(sourceFilePath)) {
  console.error("No service check report found. Run npm run services:check first.");
  process.exit(1);
}

const raw = fs.readFileSync(sourceFilePath, "utf8");
const rows = JSON.parse(raw);

if (!Array.isArray(rows) || rows.length === 0) {
  console.error(`Report is empty: ${sourceFilePath}`);
  process.exit(1);
}

const checkedAt = rows[0]?.checkedAt;
if (!checkedAt) {
  console.error("Report does not contain checkedAt.");
  process.exit(1);
}

const totalCount = rows.length;
const okCount = rows.filter((row) => row.ok).length;
const failedCount = totalCount - okCount;
const runId = randomUUID();

const client = new Client({
  connectionString: databaseUrl,
});

function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

await client.connect();

try {
  await client.query("BEGIN");

  await client.query(
    `INSERT INTO service_check_runs (
      id,
      source_file,
      checked_at,
      total_count,
      ok_count,
      failed_count
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      runId,
      path.basename(sourceFilePath),
      checkedAt,
      totalCount,
      okCount,
      failedCount,
    ],
  );

  const batches = chunkArray(rows, 250);

  for (const batch of batches) {
    const values = [];
    const placeholders = [];

    for (const row of batch) {
      const toolId =
        Number.isInteger(row.sourceIndex) && row.sourceIndex > 0 ? row.sourceIndex : null;

      const base = values.length;
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14})`,
      );

      values.push(
        randomUUID(),
        runId,
        toolId,
        row.sourceIndex,
        row.name,
        row.entityType ?? null,
        row.url,
        Boolean(row.ok),
        typeof row.status === "number" ? row.status : null,
        row.finalUrl ?? null,
        Boolean(row.redirected),
        typeof row.responseTimeMs === "number" ? row.responseTimeMs : null,
        row.error ?? null,
        row.checkedAt,
      );
    }

    await client.query(
      `INSERT INTO service_check_results (
        id,
        run_id,
        tool_id,
        source_index,
        name,
        entity_type,
        url,
        ok,
        status,
        final_url,
        redirected,
        response_time_ms,
        error,
        checked_at
      ) VALUES ${placeholders.join(", ")}`,
      values,
    );
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}

console.log(`Imported run: ${runId}`);
console.log(`Source file: ${sourceFilePath}`);
console.log(`Total: ${totalCount}, ok: ${okCount}, failed: ${failedCount}`);
console.log("Done.");
