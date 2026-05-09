import { Client } from "pg";

const databaseUrl =
  process.env.DATABASE_URL || "postgresql://marusya@127.0.0.1:54329/marusya_ai";

const client = new Client({
  connectionString: databaseUrl,
});

await client.connect();

try {
  await client.query("BEGIN");

  const latestRunResult = await client.query(
    `SELECT id, checked_at
     FROM service_check_runs
     ORDER BY checked_at DESC, imported_at DESC
     LIMIT 1`,
  );

  const latestRun = latestRunResult.rows[0];

  if (!latestRun?.id) {
    throw new Error("No service_check_runs found. Import service checks first.");
  }

  const resetResult = await client.query(
    `UPDATE ai_tools
     SET works_in_russia = NULL,
         updated_at = NOW()`,
  );

  const updateOkResult = await client.query(
    `UPDATE ai_tools
     SET works_in_russia = service_status.ok,
         updated_at = NOW()
     FROM (
       SELECT DISTINCT ON (tool_id)
         tool_id,
         ok
       FROM service_check_results
       WHERE run_id = $1
         AND tool_id IS NOT NULL
       ORDER BY tool_id, checked_at DESC, id DESC
     ) AS service_status
     WHERE ai_tools.id = service_status.tool_id`,
    [latestRun.id],
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

  console.log(`Latest run: ${latestRun.id}`);
  console.log(`Checked at: ${latestRun.checked_at}`);
  console.log(`Reset tools: ${resetResult.rowCount ?? 0}`);
  console.log(`Updated from service checks: ${updateOkResult.rowCount ?? 0}`);
  console.log(
    `works_in_russia => true: ${summary.trueCount}, false: ${summary.falseCount}, null: ${summary.nullCount}`,
  );
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
