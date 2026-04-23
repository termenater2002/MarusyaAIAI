import { NextResponse } from "next/server";

import { getPool } from "@/lib/server/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const toolId = Number(id);

  if (!Number.isFinite(toolId)) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const pool = getPool();
  const toolResult = await pool.query(
    `SELECT
      id,
      name,
      entity_type AS "entityType",
      url,
      image_url AS "imageUrl",
      short_description AS description,
      long_description AS "longDescription",
      works_in_russia AS "worksInRussia",
      needs_vpn AS "needsVPN",
      requires_registration AS "requiresRegistration",
      is_free AS "isFree",
      editorial_rating AS "editorialRating"
    FROM ai_tools
    WHERE id = $1
    LIMIT 1`,
    [toolId],
  );

  const tool = toolResult.rows[0];

  if (!tool) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const [categoriesResult, tagsResult, featuresResult, ratingSummaryResult] = await Promise.all([
    pool.query(
      `SELECT categories.id, categories.source_name AS name
       FROM ai_tool_categories
       INNER JOIN categories ON categories.id = ai_tool_categories.category_id
       WHERE ai_tool_categories.tool_id = $1
       ORDER BY categories.id`,
      [toolId],
    ),
    pool.query(
      `SELECT tag_name AS name
       FROM ai_tool_tags
       WHERE tool_id = $1
       ORDER BY tag_name`,
      [toolId],
    ),
    pool.query(
      `SELECT feature_text AS text
       FROM ai_tool_features
       WHERE tool_id = $1
       ORDER BY position_index`,
      [toolId],
    ),
    pool.query(
      `SELECT
        ROUND(AVG(rating_value)::numeric, 2) AS "averageUserRating",
        COUNT(*)::int AS "userRatingCount"
       FROM user_ratings
       WHERE tool_id = $1`,
      [toolId],
    ),
  ]);

  return NextResponse.json({
    ...tool,
    categories: categoriesResult.rows,
    tags: tagsResult.rows.map((tag) => tag.name),
    features: featuresResult.rows.map((feature) => feature.text),
    ratingSummary: ratingSummaryResult.rows[0] ?? {
      averageUserRating: null,
      userRatingCount: 0,
    },
  });
}
