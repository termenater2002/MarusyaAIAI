import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

const repoRoot = process.cwd();
const reportsDir = path.join(repoRoot, "database", "service-checks");
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://marusya@127.0.0.1:54329/marusya_ai";

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

const sourceFilePath = getLatestReportFile();

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

const updates = rows
  .map((row) => ({
    toolId: Number(row.sourceIndex),
    worksInRussia: Boolean(row.ok),
  }))
  .filter((row) => Number.isInteger(row.toolId) && row.toolId > 0);
const trueIds = updates
  .filter((row) => row.worksInRussia)
  .map((row) => row.toolId);

const client = new Client({
  connectionString: databaseUrl,
});

await client.connect();

try {
  await client.query("BEGIN");

  await client.query(
    `UPDATE ai_tools
     SET works_in_russia = FALSE,
         updated_at = NOW()`,
  );

  await client.query(
    `UPDATE ai_tools
     SET works_in_russia = TRUE,
         updated_at = NOW()
     WHERE id = ANY($1::int[])`,
    [trueIds],
  );

  const summaryResult = await client.query(
    `SELECT
      COUNT(*) FILTER (WHERE works_in_russia IS TRUE)::int AS "trueCount",
      COUNT(*) FILTER (WHERE works_in_russia IS FALSE)::int AS "falseCount",
      COUNT(*) FILTER (WHERE works_in_russia IS NULL)::int AS "nullCount"
     FROM ai_tools`,
  );

  await client.query("COMMIT");

  const summary = summaryResult.rows[0] ?? {
    trueCount: 0,
    falseCount: 0,
    nullCount: 0,
  };

  console.log(`Applied source report: ${path.basename(sourceFilePath)}`);
  console.log(
    `works_in_russia => true: ${summary.trueCount}, false: ${summary.falseCount}, null: ${summary.nullCount}`,
  );
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
