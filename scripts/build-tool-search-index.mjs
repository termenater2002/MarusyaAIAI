import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL || "postgresql://marusya@127.0.0.1:54329/marusya_ai";
const openAiApiKey = process.env.OPENAI_API_KEY || "";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index];
  const nextToken = process.argv[index + 1];

  if (token.startsWith("--")) {
    if (!nextToken || nextToken.startsWith("--")) {
      args.set(token, "true");
    } else {
      args.set(token, nextToken);
      index += 1;
    }
  }
}

const skipEmbeddings = args.get("--skip-embeddings") === "true";
const limit = Number(args.get("--limit") ?? "0");
const batchSize = Math.max(1, Number(args.get("--batch-size") ?? "50"));

function normalizeText(input) {
  return String(input ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchableRepresentation(tool) {
  const nameText = normalizeText(tool.name);
  const entityTypeText = normalizeText(tool.entityType);
  const descriptionText = normalizeText(tool.description);
  const longDescriptionText = normalizeText(tool.longDescription);
  const tagsText = normalizeText((tool.tags ?? []).join(", "));
  const featuresText = normalizeText((tool.features ?? []).join(". "));
  const categoriesText = normalizeText(
    (tool.categories ?? [])
      .map((category) => category.name)
      .filter(Boolean)
      .join(", "),
  );

  const searchableText = normalizeText(
    [
      `Название: ${nameText}`,
      `Тип: ${entityTypeText}`,
      categoriesText ? `Категории: ${categoriesText}` : "",
      tagsText ? `Теги: ${tagsText}` : "",
      featuresText ? `Фичи: ${featuresText}` : "",
      descriptionText ? `Кратко: ${descriptionText}` : "",
      longDescriptionText ? `Подробно: ${longDescriptionText}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return {
    nameText,
    entityTypeText,
    descriptionText,
    longDescriptionText,
    tagsText,
    featuresText,
    categoriesText,
    searchableText,
  };
}

async function createEmbeddings(inputs) {
  if (!openAiApiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: inputs,
      encoding_format: "float",
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI embeddings failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return (data.data ?? [])
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.embedding);
}

const client = new Client({
  connectionString: databaseUrl,
});

await client.connect();

try {
  const result = await client.query(
    `SELECT
      ai_tools.id,
      ai_tools.name,
      ai_tools.entity_type AS "entityType",
      ai_tools.short_description AS description,
      ai_tools.long_description AS "longDescription",
      COALESCE((
        SELECT json_agg(tag_name ORDER BY tag_name)
        FROM ai_tool_tags
        WHERE ai_tool_tags.tool_id = ai_tools.id
      ), '[]'::json) AS tags,
      COALESCE((
        SELECT json_agg(feature_text ORDER BY position_index)
        FROM ai_tool_features
        WHERE ai_tool_features.tool_id = ai_tools.id
      ), '[]'::json) AS features,
      COALESCE((
        SELECT json_agg(json_build_object('id', categories.id, 'name', categories.source_name) ORDER BY categories.id)
        FROM ai_tool_categories
        INNER JOIN categories ON categories.id = ai_tool_categories.category_id
        WHERE ai_tool_categories.tool_id = ai_tools.id
      ), '[]'::json) AS categories
    FROM ai_tools
    ORDER BY ai_tools.id ASC
    ${limit > 0 ? `LIMIT ${limit}` : ""}`,
  );

  const tools = result.rows.map((row) => ({
    id: Number(row.id),
    ...buildSearchableRepresentation(row),
  }));

  console.log(`Indexing ${tools.length} tools`);

  for (let offset = 0; offset < tools.length; offset += batchSize) {
    const batch = tools.slice(offset, offset + batchSize);
    const embeddings =
      skipEmbeddings || !openAiApiKey
        ? batch.map(() => null)
        : await createEmbeddings(batch.map((tool) => tool.searchableText));

    for (let index = 0; index < batch.length; index += 1) {
      const tool = batch[index];
      const embedding = embeddings[index] ?? null;

      await client.query(
        `INSERT INTO ai_tool_search_index (
          tool_id,
          name_text,
          entity_type_text,
          description_text,
          long_description_text,
          tags_text,
          features_text,
          categories_text,
          searchable_text,
          embedding_model,
          embedding,
          embedding_updated_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, NOW()
        )
        ON CONFLICT (tool_id) DO UPDATE SET
          name_text = EXCLUDED.name_text,
          entity_type_text = EXCLUDED.entity_type_text,
          description_text = EXCLUDED.description_text,
          long_description_text = EXCLUDED.long_description_text,
          tags_text = EXCLUDED.tags_text,
          features_text = EXCLUDED.features_text,
          categories_text = EXCLUDED.categories_text,
          searchable_text = EXCLUDED.searchable_text,
          embedding_model = EXCLUDED.embedding_model,
          embedding = EXCLUDED.embedding,
          embedding_updated_at = EXCLUDED.embedding_updated_at,
          updated_at = NOW()`,
        [
          tool.id,
          tool.nameText,
          tool.entityTypeText,
          tool.descriptionText,
          tool.longDescriptionText,
          tool.tagsText,
          tool.featuresText,
          tool.categoriesText,
          tool.searchableText,
          embedding ? "text-embedding-3-small" : null,
          embedding ? JSON.stringify(embedding) : null,
          embedding ? new Date().toISOString() : null,
        ],
      );
    }

    console.log(`Processed ${Math.min(offset + batch.length, tools.length)}/${tools.length}`);
  }

  console.log("Tool search index updated.");
} finally {
  await client.end();
}
