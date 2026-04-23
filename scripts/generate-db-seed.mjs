import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const datasetPath = path.resolve(repoRoot, "../AIDATASET_deduped_items.json");
const outputPath = path.resolve(repoRoot, "database/seed.sql");

const categoryNames = new Map([
  [1, "Текст и чат"],
  [2, "Код и разработка"],
  [3, "Изображения"],
  [4, "Видео"],
  [5, "Аудио и голос"],
  [6, "Дизайн"],
  [7, "Продуктивность"],
  [8, "Обучение"],
  [9, "Перевод"],
  [10, "Поиск и анализ"],
  [11, "Маркетинг и копирайтинг"],
  [12, "Социальные сети"],
  [13, "Автоматизация"],
  [14, "Документы и PDF"],
  [15, "3D и моделирование"],
  [16, "Игры и развлечения"],
]);

const raw = fs.readFileSync(datasetPath, "utf8");
const data = JSON.parse(raw);

const escapeSql = (value) => String(value).replaceAll("'", "''");

const sqlString = (value) => {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return `'${escapeSql(value)}'`;
};

const sqlBoolean = (value) => {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return value ? "TRUE" : "FALSE";
};

const sqlNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "NULL";
  }

  return String(value);
};

const categoryIds = [...new Set(data.flatMap((item) => item.categoryIds ?? []))].sort(
  (left, right) => left - right,
);

const tagNames = [...new Set(data.flatMap((item) => item.tags ?? []))].sort(
  (left, right) => left.localeCompare(right, "ru"),
);

const lines = [
  "-- Auto-generated from ../AIDATASET_deduped_items.json",
  "-- Regenerate with: npm run db:seed:generate",
  "BEGIN TRANSACTION;",
  "",
];

for (const categoryId of categoryIds) {
  lines.push(
    `INSERT INTO categories (id, source_name) VALUES (${categoryId}, ${sqlString(categoryNames.get(categoryId) ?? null)}) ON CONFLICT (id) DO NOTHING;`,
  );
}

lines.push("");

for (const tagName of tagNames) {
  lines.push(`INSERT INTO tags (name) VALUES (${sqlString(tagName)}) ON CONFLICT (name) DO NOTHING;`);
}

lines.push("");

data.forEach((item, index) => {
  const toolId = index + 1;

  lines.push(
    [
      "INSERT INTO ai_tools (",
      "  id,",
      "  name,",
      "  entity_type,",
      "  url,",
      "  image_url,",
      "  short_description,",
      "  long_description,",
      "  works_in_russia,",
      "  needs_vpn,",
      "  requires_registration,",
      "  is_free,",
      "  editorial_rating",
      ") VALUES (",
      `  ${toolId},`,
      `  ${sqlString(item.name)},`,
      `  ${sqlString(item.entityType)},`,
      `  ${sqlString(item.url)},`,
      "  NULL,",
      `  ${sqlString(item.description)},`,
      `  ${sqlString(item.longDescription)},`,
      `  ${sqlBoolean(item.availability?.worksInRussia)},`,
      `  ${sqlBoolean(item.availability?.needsVPN)},`,
      `  ${sqlBoolean(item.availability?.requiresRegistration)},`,
      `  ${sqlBoolean(item.availability?.isFree)},`,
      "  NULL",
      ") ON CONFLICT (id) DO NOTHING;",
    ].join("\n"),
  );

  for (const categoryId of item.categoryIds ?? []) {
    lines.push(
      `INSERT INTO ai_tool_categories (tool_id, category_id) VALUES (${toolId}, ${categoryId}) ON CONFLICT (tool_id, category_id) DO NOTHING;`,
    );
  }

  for (const tagName of item.tags ?? []) {
    lines.push(
      `INSERT INTO ai_tool_tags (tool_id, tag_name) VALUES (${toolId}, ${sqlString(tagName)}) ON CONFLICT (tool_id, tag_name) DO NOTHING;`,
    );
  }

  (item.features ?? []).forEach((feature, featureIndex) => {
    lines.push(
      `INSERT INTO ai_tool_features (tool_id, position_index, feature_text) VALUES (${toolId}, ${featureIndex + 1}, ${sqlString(feature)}) ON CONFLICT (tool_id, position_index) DO NOTHING;`,
    );
  });

  lines.push("");
});

lines.push("COMMIT;");
lines.push("");

fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

console.log(`Seed SQL written to ${outputPath}`);
console.log(`AI tools: ${sqlNumber(data.length)}`);
console.log(`Categories: ${sqlNumber(categoryIds.length)}`);
console.log(`Tags: ${sqlNumber(tagNames.length)}`);
