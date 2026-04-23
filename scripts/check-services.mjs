import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const datasetPath = path.resolve(repoRoot, "../AIDATASET_deduped_items.json");
const reportsDir = path.resolve(repoRoot, "database", "service-checks");

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const current = process.argv[index];
  if (current.startsWith("--")) {
    args.set(current, process.argv[index + 1] && !process.argv[index + 1].startsWith("--")
      ? process.argv[index + 1]
      : "true");
  }
}

const concurrency = Math.max(1, Number(args.get("--concurrency") ?? "10"));
const timeoutMs = Math.max(1000, Number(args.get("--timeout") ?? "10000"));
const rawLimit = args.get("--limit");
const limit = rawLimit ? Math.max(1, Number(rawLimit)) : 0;
const onlyFailed = args.get("--only-failed") === "true";

const rawDataset = fs.readFileSync(datasetPath, "utf8");
const dataset = JSON.parse(rawDataset);
const items = limit > 0 ? dataset.slice(0, limit) : dataset;

fs.mkdirSync(reportsDir, { recursive: true });

function escapeCsv(value) {
  const stringValue = value == null ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

async function checkUrl(url) {
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "user-agent": "MarusyaAI Service Checker/1.0",
      },
    });

    try {
      await response.body?.cancel();
    } catch {
      // ignore body cancellation errors
    }

    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      redirected: response.redirected,
      responseTimeMs: Date.now() - startedAt,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      finalUrl: url,
      redirected: false,
      responseTimeMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function runWithConcurrency(entries, worker, parallelism) {
  const results = new Array(entries.length);
  let cursor = 0;

  async function runner() {
    while (cursor < entries.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(entries[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(parallelism, entries.length) }, () => runner()),
  );

  return results;
}

console.log(`Checking ${items.length} services with concurrency=${concurrency}, timeout=${timeoutMs}ms`);

const checkedAt = new Date().toISOString();

const results = await runWithConcurrency(
  items,
  async (item, index) => {
    const result = await checkUrl(item.url);
    const row = {
      sourceIndex: index + 1,
      checkedAt,
      name: item.name,
      entityType: item.entityType,
      url: item.url,
      ok: result.ok,
      status: result.status,
      finalUrl: result.finalUrl,
      redirected: result.redirected,
      responseTimeMs: result.responseTimeMs,
      error: result.error,
    };

    const statusLabel = result.status ?? "ERR";
    console.log(`[${index + 1}/${items.length}] ${statusLabel} ${item.name}`);
    return row;
  },
  concurrency,
);

const filteredResults = onlyFailed ? results.filter((row) => !row.ok) : results;
const timestamp = checkedAt.replaceAll(":", "-");
const jsonPath = path.join(reportsDir, `service-checks-${timestamp}.json`);
const csvPath = path.join(reportsDir, `service-checks-${timestamp}.csv`);

fs.writeFileSync(jsonPath, JSON.stringify(filteredResults, null, 2), "utf8");

const csvHeader = [
  "sourceIndex",
  "checkedAt",
  "name",
  "entityType",
  "url",
  "ok",
  "status",
  "finalUrl",
  "redirected",
  "responseTimeMs",
  "error",
];

const csvLines = [
  csvHeader.join(","),
  ...filteredResults.map((row) =>
    [
      row.sourceIndex,
      row.checkedAt,
      row.name,
      row.entityType,
      row.url,
      row.ok,
      row.status,
      row.finalUrl,
      row.redirected,
      row.responseTimeMs,
      row.error,
    ]
      .map(escapeCsv)
      .join(","),
  ),
];

fs.writeFileSync(csvPath, `${csvLines.join("\n")}\n`, "utf8");

const okCount = results.filter((row) => row.ok).length;
const failedCount = results.length - okCount;

console.log("");
console.log(`Done. OK: ${okCount}, failed: ${failedCount}`);
console.log(`JSON: ${jsonPath}`);
console.log(`CSV:  ${csvPath}`);
console.log("");
console.log("Examples:");
console.log("npm run services:check");
console.log("npm run services:check -- --limit 50");
console.log("npm run services:check -- --concurrency 20 --timeout 15000");
console.log("npm run services:check -- --only-failed");
