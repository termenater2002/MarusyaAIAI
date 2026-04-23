import { z } from "zod";

import { getPool } from "@/lib/server/db";
import {
  createEmbedding,
  createStructuredChatCompletion,
  hasOpenAiApiKey,
} from "@/lib/server/openai";

const QUERY_PARSE_SCHEMA = z.object({
  normalizedQuery: z.string(),
  keywords: z.array(z.string()).max(12),
  filters: z.object({
    isFree: z.boolean().nullable(),
    requiresRegistration: z.boolean().nullable(),
    worksInRussia: z.boolean().nullable(),
    needsVPN: z.boolean().nullable(),
  }),
});

const RERANK_SCHEMA = z.object({
  results: z.array(
    z.object({
      toolId: z.number().int(),
      score: z.number().min(0).max(1),
      reason: z.string().min(1).max(240),
    }),
  ),
});

const FINAL_RESULTS_LIMIT = 10;
const RERANK_INPUT_LIMIT = 12;

export type ParsedToolQuery = z.infer<typeof QUERY_PARSE_SCHEMA>;

export type ToolSearchItem = {
  id: number;
  name: string;
  entityType: string;
  url: string;
  imageUrl: string | null;
  description: string;
  longDescription: string | null;
  editorialRating: number | null;
  worksInRussia: boolean | null;
  needsVPN: boolean | null;
  requiresRegistration: boolean | null;
  isFree: boolean | null;
  tags: string[];
  features: string[];
  categories: Array<{
    id: number;
    name: string | null;
  }>;
};

type RetrievalCandidate = {
  item: ToolSearchItem;
  textScore: number;
  semanticScore: number;
  fieldScore: number;
  finalScore: number;
};

type SearchableRepresentation = {
  nameText: string;
  entityTypeText: string;
  descriptionText: string;
  longDescriptionText: string;
  tagsText: string;
  featuresText: string;
  categoriesText: string;
  searchableText: string;
};

type IndexRow = ToolSearchItem & SearchableRepresentation & { embedding: number[] | null };

const FILTER_PATTERNS = {
  isFree: [/бесплат/i, /\bfree\b/i, /даром/i],
  noRegistration: [/без\s+регистрац/i, /\bno\s+registration\b/i],
  needsRegistration: [/\bс\s+регистрац/i, /требует\s+регистрац/i],
  worksInRussia: [/работает\s+в\s+росси/i, /для\s+росси/i, /\bв\s+рф\b/i],
  noVpn: [/без\s+vpn/i, /без\s+впн/i],
  withVpn: [/\bс\s+vpn\b/i, /нужен\s+vpn/i, /через\s+vpn/i],
} as const;

const STOPWORDS = new Set([
  "для",
  "или",
  "под",
  "это",
  "есть",
  "как",
  "что",
  "нужно",
  "можно",
  "сервис",
  "сайт",
  "инструмент",
  "нейросеть",
  "аналог",
  "без",
  "через",
  "the",
  "and",
  "with",
  "tool",
  "site",
]);

function normalizeText(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function tokenize(input: string) {
  return normalizeText(input)
    .toLowerCase()
    .split(/[^a-zа-я0-9#+.-]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function setIfPresent<T>(value: T | null | undefined, fallback: T | null) {
  return value ?? fallback;
}

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function scoreKeywordMatches(tokens: string[], item: IndexRow) {
  if (tokens.length === 0) {
    return 0;
  }

  let total = 0;

  for (const token of tokens) {
    const lowerToken = token.toLowerCase();

    if (item.nameText.toLowerCase().includes(lowerToken)) {
      total += 3;
    }

    if (item.tagsText.toLowerCase().includes(lowerToken)) {
      total += 2.5;
    }

    if (item.featuresText.toLowerCase().includes(lowerToken)) {
      total += 2;
    }

    if (item.categoriesText.toLowerCase().includes(lowerToken)) {
      total += 2;
    }

    if (item.descriptionText.toLowerCase().includes(lowerToken)) {
      total += 1.5;
    }

    if (item.longDescriptionText.toLowerCase().includes(lowerToken)) {
      total += 1;
    }
  }

  const maxPossible = tokens.length * 12;
  return Math.min(1, total / maxPossible);
}

function scoreIntentBoost(query: ParsedToolQuery, item: IndexRow) {
  const combined = `${query.normalizedQuery} ${query.keywords.join(" ")}`.toLowerCase();
  const categoryIds = new Set(item.categories.map((category) => category.id));
  const tags = item.tags.map((tag) => tag.toLowerCase());
  const features = item.features.join(" ").toLowerCase();
  let score = 0;

  if (/(код|кода|code|coding|program|разработ)/i.test(combined)) {
    if (categoryIds.has(2)) score += 0.6;
    if (tags.some((tag) => /(code|coding|developer|program)/.test(tag))) score += 0.35;
    if (features.includes("код") || features.includes("program")) score += 0.15;
  }

  if (/(фон|background)/i.test(combined) && /(удал|remove)/i.test(combined)) {
    if (categoryIds.has(3) || categoryIds.has(6)) score += 0.5;
    if (tags.some((tag) => /(background|remov)/.test(tag))) score += 0.35;
    if (features.includes("фон")) score += 0.15;
  }

  if (/(промпт|prompt)/i.test(combined)) {
    if (tags.some((tag) => /(prompt|prompts|template)/.test(tag))) score += 0.45;
    if (features.includes("промпт")) score += 0.2;
  }

  if (/(аудио|голос|voice|audio|transcrib|расшифр)/i.test(combined)) {
    if (categoryIds.has(5)) score += 0.55;
    if (tags.some((tag) => /(audio|voice|transcription|speech)/.test(tag))) score += 0.35;
    if (features.includes("аудио") || features.includes("реч")) score += 0.15;
  }

  return Math.min(1, score);
}

function buildFallbackReason(query: ParsedToolQuery, candidate: RetrievalCandidate) {
  const reasons: string[] = [];
  const keywords = query.keywords.slice(0, 4);

  if (keywords.length > 0) {
    reasons.push(`совпадает по запросу: ${keywords.join(", ")}`);
  }

  if (candidate.item.isFree) {
    reasons.push("есть бесплатный доступ");
  }

  if (candidate.item.requiresRegistration === false) {
    reasons.push("можно использовать без регистрации");
  }

  if (candidate.item.worksInRussia) {
    reasons.push("отмечен как работающий в России");
  }

  if (candidate.item.needsVPN === false) {
    reasons.push("не требует VPN");
  }

  if (reasons.length === 0) {
    reasons.push("хорошо совпадает по описанию, тегам и фичам");
  }

  return `${candidate.item.name}: ${reasons.slice(0, 2).join(", ")}.`;
}

function toPublicToolItem(item: ToolSearchItem | IndexRow): ToolSearchItem {
  return {
    id: item.id,
    name: item.name,
    entityType: item.entityType,
    url: item.url,
    imageUrl: item.imageUrl,
    description: item.description,
    longDescription: item.longDescription,
    editorialRating: item.editorialRating,
    worksInRussia: item.worksInRussia,
    needsVPN: item.needsVPN,
    requiresRegistration: item.requiresRegistration,
    isFree: item.isFree,
    tags: item.tags,
    features: item.features,
    categories: item.categories,
  };
}

export function buildSearchableRepresentation(tool: {
  name: string;
  entityType: string;
  description: string;
  longDescription: string | null;
  tags: string[];
  features: string[];
  categories: Array<{ id: number; name: string | null }>;
}) {
  const nameText = normalizeText(tool.name);
  const entityTypeText = normalizeText(tool.entityType);
  const descriptionText = normalizeText(tool.description);
  const longDescriptionText = normalizeText(tool.longDescription ?? "");
  const tagsText = normalizeText(tool.tags.join(", "));
  const featuresText = normalizeText(tool.features.join(". "));
  const categoriesText = normalizeText(
    tool.categories
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
  } satisfies SearchableRepresentation;
}

function parseFiltersDeterministically(query: string) {
  const normalized = normalizeText(query.toLowerCase());

  const isFree = FILTER_PATTERNS.isFree.some((pattern) => pattern.test(normalized)) ? true : null;
  const requiresRegistration = FILTER_PATTERNS.noRegistration.some((pattern) =>
    pattern.test(normalized),
  )
    ? false
    : FILTER_PATTERNS.needsRegistration.some((pattern) => pattern.test(normalized))
      ? true
      : null;
  const worksInRussia = FILTER_PATTERNS.worksInRussia.some((pattern) => pattern.test(normalized))
    ? true
    : null;
  const needsVPN = FILTER_PATTERNS.noVpn.some((pattern) => pattern.test(normalized))
    ? false
    : FILTER_PATTERNS.withVpn.some((pattern) => pattern.test(normalized))
      ? true
      : null;

  return {
    isFree,
    requiresRegistration,
    worksInRussia,
    needsVPN,
  };
}

function parseQueryFallback(query: string): ParsedToolQuery {
  const normalizedQuery = normalizeText(query);
  const keywords = [...new Set(tokenize(query))].slice(0, 10);

  return {
    normalizedQuery,
    keywords,
    filters: parseFiltersDeterministically(query),
  };
}

export async function parseUserToolQuery(query: string): Promise<ParsedToolQuery> {
  const fallback = parseQueryFallback(query);

  if (!hasOpenAiApiKey()) {
    return fallback;
  }

  try {
    const parsed = await createStructuredChatCompletion({
      name: "tool_query_parse",
      schema: QUERY_PARSE_SCHEMA,
      system:
        "Ты разбираешь запрос пользователя для поиска по каталогу инструментов. " +
        "Верни только нормализованный поисковый смысл, ключевые слова и фильтры availability. " +
        "Не добавляй свойства, которых нет в запросе явно или почти явно.",
      user:
        `Запрос пользователя:\n${query}\n\n` +
        `Детерминированные фильтры-подсказки:\n${JSON.stringify(fallback.filters)}\n\n` +
        "Сохрани смысл коротко. Ключевые слова должны быть полезны для поиска по каталогу.",
    });

    return {
      normalizedQuery: normalizeText(parsed.normalizedQuery || fallback.normalizedQuery),
      keywords:
        parsed.keywords
          .map((keyword) => normalizeText(keyword))
          .filter(Boolean)
          .slice(0, 10) || fallback.keywords,
      filters: {
        isFree: setIfPresent(parsed.filters.isFree, fallback.filters.isFree),
        requiresRegistration: setIfPresent(
          parsed.filters.requiresRegistration,
          fallback.filters.requiresRegistration,
        ),
        worksInRussia: setIfPresent(parsed.filters.worksInRussia, fallback.filters.worksInRussia),
        needsVPN: setIfPresent(parsed.filters.needsVPN, fallback.filters.needsVPN),
      },
    };
  } catch {
    return fallback;
  }
}

function buildFilterSql(parsedQuery: ParsedToolQuery) {
  const whereClauses: string[] = [];
  const values: Array<boolean | string | number> = [];
  let valueIndex = 1;

  const filters = parsedQuery.filters;

  if (filters.isFree !== null) {
    whereClauses.push(`ai_tools.is_free = $${valueIndex}`);
    values.push(filters.isFree);
    valueIndex += 1;
  }

  if (filters.requiresRegistration !== null) {
    whereClauses.push(`ai_tools.requires_registration = $${valueIndex}`);
    values.push(filters.requiresRegistration);
    valueIndex += 1;
  }

  if (filters.worksInRussia !== null) {
    whereClauses.push(`ai_tools.works_in_russia = $${valueIndex}`);
    values.push(filters.worksInRussia);
    valueIndex += 1;
  }

  if (filters.needsVPN !== null) {
    whereClauses.push(`ai_tools.needs_vpn = $${valueIndex}`);
    values.push(filters.needsVPN);
    valueIndex += 1;
  }

  return {
    whereSql: whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "",
    values,
    nextIndex: valueIndex,
  };
}

function mapIndexRow(row: Record<string, unknown>): IndexRow {
  const categoriesRaw = (row.categories as Array<{ id: number; name: string | null }>) ?? [];
  const tagsRaw = (row.tags as string[]) ?? [];
  const featuresRaw = (row.features as string[]) ?? [];
  const searchable = {
    nameText: String(row.nameText ?? ""),
    entityTypeText: String(row.entityTypeText ?? ""),
    descriptionText: String(row.descriptionText ?? ""),
    longDescriptionText: String(row.longDescriptionText ?? ""),
    tagsText: String(row.tagsText ?? ""),
    featuresText: String(row.featuresText ?? ""),
    categoriesText: String(row.categoriesText ?? ""),
    searchableText: String(row.searchableText ?? ""),
  };

  return {
    id: Number(row.id),
    name: String(row.name),
    entityType: String(row.entityType),
    url: String(row.url),
    imageUrl: (row.imageUrl as string | null) ?? null,
    description: String(row.description ?? ""),
    longDescription: (row.longDescription as string | null) ?? null,
    editorialRating:
      row.editorialRating === null || row.editorialRating === undefined
        ? null
        : Number(row.editorialRating),
    worksInRussia:
      row.worksInRussia === null || row.worksInRussia === undefined
        ? null
        : Boolean(row.worksInRussia),
    needsVPN:
      row.needsVPN === null || row.needsVPN === undefined ? null : Boolean(row.needsVPN),
    requiresRegistration:
      row.requiresRegistration === null || row.requiresRegistration === undefined
        ? null
        : Boolean(row.requiresRegistration),
    isFree: row.isFree === null || row.isFree === undefined ? null : Boolean(row.isFree),
    tags: tagsRaw,
    features: featuresRaw,
    categories: categoriesRaw,
    ...searchable,
    embedding: Array.isArray(row.embedding) ? (row.embedding as number[]) : null,
  };
}

async function getTextCandidates(parsedQuery: ParsedToolQuery, limit: number) {
  const pool = getPool();
  const { whereSql, values, nextIndex } = buildFilterSql(parsedQuery);
  const textQuery = normalizeText(
    [parsedQuery.normalizedQuery, ...parsedQuery.keywords].filter(Boolean).join(" "),
  );

  if (!textQuery) {
    return [] as Array<RetrievalCandidate>;
  }

  const tsQueryIndex = nextIndex;
  const likeQueryIndex = nextIndex + 1;
  const limitIndex = nextIndex + 2;

  const rows = await pool.query(
    `SELECT
      ai_tools.id,
      ai_tools.name,
      ai_tools.entity_type AS "entityType",
      ai_tools.url,
      ai_tools.image_url AS "imageUrl",
      ai_tools.short_description AS description,
      ai_tools.long_description AS "longDescription",
      ai_tools.editorial_rating AS "editorialRating",
      ai_tools.works_in_russia AS "worksInRussia",
      ai_tools.needs_vpn AS "needsVPN",
      ai_tools.requires_registration AS "requiresRegistration",
      ai_tools.is_free AS "isFree",
      ai_tool_search_index.name_text AS "nameText",
      ai_tool_search_index.entity_type_text AS "entityTypeText",
      ai_tool_search_index.description_text AS "descriptionText",
      ai_tool_search_index.long_description_text AS "longDescriptionText",
      ai_tool_search_index.tags_text AS "tagsText",
      ai_tool_search_index.features_text AS "featuresText",
      ai_tool_search_index.categories_text AS "categoriesText",
      ai_tool_search_index.searchable_text AS "searchableText",
      ai_tool_search_index.embedding,
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
      ), '[]'::json) AS categories,
      ts_rank_cd(ai_tool_search_index.search_vector, plainto_tsquery('simple', $${tsQueryIndex})) AS "textRank"
    FROM ai_tools
    INNER JOIN ai_tool_search_index ON ai_tool_search_index.tool_id = ai_tools.id
    ${whereSql}
    ${whereSql ? "AND" : "WHERE"}
      (
        ai_tool_search_index.search_vector @@ plainto_tsquery('simple', $${tsQueryIndex})
        OR ai_tools.name ILIKE $${likeQueryIndex} ESCAPE '\\'
        OR ai_tool_search_index.tags_text ILIKE $${likeQueryIndex} ESCAPE '\\'
        OR ai_tool_search_index.features_text ILIKE $${likeQueryIndex} ESCAPE '\\'
        OR ai_tool_search_index.categories_text ILIKE $${likeQueryIndex} ESCAPE '\\'
      )
    ORDER BY "textRank" DESC, ai_tools.editorial_rating DESC NULLS LAST, ai_tools.id ASC
    LIMIT $${limitIndex}`,
    [...values, textQuery, `%${escapeLike(textQuery)}%`, limit],
  );

  const maxTextRank = Math.max(...rows.rows.map((row) => Number(row.textRank ?? 0)), 1);

  return rows.rows.map((row) => {
    const item = mapIndexRow(row);
    const textScore = Math.max(0, Number(row.textRank ?? 0) / maxTextRank);
    const fieldScore = scoreKeywordMatches(parsedQuery.keywords, item);
    const intentScore = scoreIntentBoost(parsedQuery, item);

    return {
      item,
      textScore,
      fieldScore: Math.max(fieldScore, intentScore),
      semanticScore: 0,
      finalScore: 0.6 * textScore + 0.2 * fieldScore + 0.2 * intentScore,
    } satisfies RetrievalCandidate;
  });
}

async function getSemanticCandidates(parsedQuery: ParsedToolQuery, limit: number) {
  if (!hasOpenAiApiKey()) {
    return [] as Array<RetrievalCandidate>;
  }

  const queryText = normalizeText(
    [parsedQuery.normalizedQuery, ...parsedQuery.keywords].filter(Boolean).join(" "),
  );

  if (!queryText) {
    return [] as Array<RetrievalCandidate>;
  }

  let queryEmbedding: number[] | null = null;

  try {
    queryEmbedding = await createEmbedding(queryText);
  } catch {
    return [] as Array<RetrievalCandidate>;
  }

  if (!queryEmbedding) {
    return [];
  }

  const pool = getPool();
  const { whereSql, values } = buildFilterSql(parsedQuery);
  const rows = await pool.query(
    `SELECT
      ai_tools.id,
      ai_tools.name,
      ai_tools.entity_type AS "entityType",
      ai_tools.url,
      ai_tools.image_url AS "imageUrl",
      ai_tools.short_description AS description,
      ai_tools.long_description AS "longDescription",
      ai_tools.editorial_rating AS "editorialRating",
      ai_tools.works_in_russia AS "worksInRussia",
      ai_tools.needs_vpn AS "needsVPN",
      ai_tools.requires_registration AS "requiresRegistration",
      ai_tools.is_free AS "isFree",
      ai_tool_search_index.name_text AS "nameText",
      ai_tool_search_index.entity_type_text AS "entityTypeText",
      ai_tool_search_index.description_text AS "descriptionText",
      ai_tool_search_index.long_description_text AS "longDescriptionText",
      ai_tool_search_index.tags_text AS "tagsText",
      ai_tool_search_index.features_text AS "featuresText",
      ai_tool_search_index.categories_text AS "categoriesText",
      ai_tool_search_index.searchable_text AS "searchableText",
      ai_tool_search_index.embedding,
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
    INNER JOIN ai_tool_search_index ON ai_tool_search_index.tool_id = ai_tools.id
    ${whereSql}
    ${whereSql ? "AND" : "WHERE"} ai_tool_search_index.embedding IS NOT NULL`,
    values,
  );

  const scored = rows.rows
    .map((row) => {
      const item = mapIndexRow(row);
      const semanticScore = item.embedding ? Math.max(0, cosineSimilarity(queryEmbedding, item.embedding)) : 0;
      const fieldScore = scoreKeywordMatches(parsedQuery.keywords, item);
      const intentScore = scoreIntentBoost(parsedQuery, item);

      return {
        item,
        textScore: 0,
        semanticScore,
        fieldScore: Math.max(fieldScore, intentScore),
        finalScore: 0.55 * semanticScore + 0.2 * fieldScore + 0.25 * intentScore,
      } satisfies RetrievalCandidate;
    })
    .sort((left, right) => right.finalScore - left.finalScore)
    .slice(0, limit);

  const maxSemantic = Math.max(...scored.map((item) => item.semanticScore), 1);

  return scored.map((candidate) => ({
    ...candidate,
    semanticScore: candidate.semanticScore / maxSemantic,
    finalScore: 0.55 * (candidate.semanticScore / maxSemantic) + 0.2 * candidate.fieldScore + 0.25 * scoreIntentBoost(parsedQuery, candidate.item as IndexRow),
  }));
}

function mergeCandidates(
  textCandidates: RetrievalCandidate[],
  semanticCandidates: RetrievalCandidate[],
  limit: number,
) {
  const merged = new Map<number, RetrievalCandidate>();

  for (const candidate of [...textCandidates, ...semanticCandidates]) {
    const existing = merged.get(candidate.item.id);

    if (!existing) {
      merged.set(candidate.item.id, candidate);
      continue;
    }

    const textScore = Math.max(existing.textScore, candidate.textScore);
    const semanticScore = Math.max(existing.semanticScore, candidate.semanticScore);
    const fieldScore = Math.max(existing.fieldScore, candidate.fieldScore);
    const ratingBoost =
      existing.item.editorialRating !== null
        ? Math.min(0.08, Number(existing.item.editorialRating) / 100)
        : 0;

    merged.set(candidate.item.id, {
      item: existing.item,
      textScore,
      semanticScore,
      fieldScore,
      finalScore:
        semanticScore > 0
          ? 0.45 * textScore + 0.35 * semanticScore + 0.2 * fieldScore + ratingBoost
          : 0.7 * textScore + 0.3 * fieldScore + ratingBoost,
    });
  }

  return [...merged.values()]
    .sort((left, right) => right.finalScore - left.finalScore)
    .slice(0, limit);
}

async function rerankCandidates(parsedQuery: ParsedToolQuery, candidates: RetrievalCandidate[]) {
  if (candidates.length === 0) {
    return [] as Array<{ item: ToolSearchItem; score: number; reason: string }>;
  }

  if (!hasOpenAiApiKey()) {
    return candidates
      .map((candidate) => ({
        item: toPublicToolItem(candidate.item),
        score: Number(candidate.finalScore.toFixed(4)),
        reason: buildFallbackReason(parsedQuery, candidate),
      }))
      .sort((left, right) => right.score - left.score);
  }

  try {
    const payload = candidates.slice(0, RERANK_INPUT_LIMIT).map((candidate) => ({
      toolId: candidate.item.id,
      name: candidate.item.name,
      entityType: candidate.item.entityType,
      description: candidate.item.description,
      longDescription: candidate.item.longDescription,
      tags: candidate.item.tags,
      features: candidate.item.features,
      categories: candidate.item.categories.map((category) => category.name).filter(Boolean),
      availability: {
        isFree: candidate.item.isFree,
        requiresRegistration: candidate.item.requiresRegistration,
        worksInRussia: candidate.item.worksInRussia,
        needsVPN: candidate.item.needsVPN,
      },
      retrievalScore: candidate.finalScore,
    }));

    const reranked = await createStructuredChatCompletion({
      name: "tool_rerank",
      schema: RERANK_SCHEMA,
      system:
        "Ты ранжируешь shortlist инструментов каталога. " +
        "Можно использовать только переданные данные. " +
        "Не придумывай свойства, которых нет. " +
        "Выбирай те варианты, которые лучше отвечают запросу пользователя.",
      user:
        `Запрос пользователя: ${parsedQuery.normalizedQuery}\n` +
        `Ключевые слова: ${parsedQuery.keywords.join(", ")}\n` +
        `Фильтры: ${JSON.stringify(parsedQuery.filters)}\n\n` +
        `Кандидаты:\n${JSON.stringify(payload)}`,
    });

    const byId = new Map(candidates.map((candidate) => [candidate.item.id, candidate]));
    const results = reranked.results
      .map((entry) => {
        const candidate = byId.get(entry.toolId);
        if (!candidate) {
          return null;
        }

        return {
          item: toPublicToolItem(candidate.item),
          score: Number(entry.score.toFixed(4)),
          reason: normalizeText(entry.reason),
        };
      })
      .filter((result): result is NonNullable<typeof result> => Boolean(result));

    if (results.length > 0) {
      return results.sort((left, right) => right.score - left.score);
    }
  } catch {
    // Fall back to heuristic explanations below.
  }

  return candidates
    .map((candidate) => ({
      item: toPublicToolItem(candidate.item),
      score: Number(candidate.finalScore.toFixed(4)),
      reason: buildFallbackReason(parsedQuery, candidate),
    }))
    .sort((left, right) => right.score - left.score);
}

export async function searchToolsByUserQuery(query: string) {
  const parsedQuery = await parseUserToolQuery(query);
  const [textCandidates, semanticCandidates] = await Promise.all([
    getTextCandidates(parsedQuery, 60),
    getSemanticCandidates(parsedQuery, 60),
  ]);

  const shortlisted = mergeCandidates(textCandidates, semanticCandidates, RERANK_INPUT_LIMIT);
  const results = await rerankCandidates(parsedQuery, shortlisted);

  return {
    query,
    parsedQuery,
    results: results.slice(0, FINAL_RESULTS_LIMIT),
  };
}
