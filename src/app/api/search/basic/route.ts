import { NextRequest, NextResponse } from "next/server";

import { getPool } from "@/lib/server/db";

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  const limit = Math.min(30, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? "18")));

  if (!query) {
    return NextResponse.json({ code: "validation", message: "Missing query" }, { status: 400 });
  }

  const likeQuery = `%${escapeLike(query)}%`;
  const pool = getPool();
  const result = await pool.query(
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
      (
        CASE WHEN ai_tools.name ILIKE $1 ESCAPE '\\' THEN 7 ELSE 0 END +
        CASE WHEN ai_tools.short_description ILIKE $1 ESCAPE '\\' THEN 3 ELSE 0 END +
        CASE WHEN COALESCE(ai_tools.long_description, '') ILIKE $1 ESCAPE '\\' THEN 2 ELSE 0 END +
        CASE WHEN EXISTS (
          SELECT 1 FROM ai_tool_tags
          WHERE ai_tool_tags.tool_id = ai_tools.id
            AND ai_tool_tags.tag_name ILIKE $1 ESCAPE '\\'
        ) THEN 4 ELSE 0 END +
        CASE WHEN EXISTS (
          SELECT 1 FROM ai_tool_features
          WHERE ai_tool_features.tool_id = ai_tools.id
            AND ai_tool_features.feature_text ILIKE $1 ESCAPE '\\'
        ) THEN 3 ELSE 0 END +
        CASE WHEN EXISTS (
          SELECT 1
          FROM ai_tool_categories
          INNER JOIN categories ON categories.id = ai_tool_categories.category_id
          WHERE ai_tool_categories.tool_id = ai_tools.id
            AND COALESCE(categories.source_name, '') ILIKE $1 ESCAPE '\\'
        ) THEN 3 ELSE 0 END
      )::int AS "matchScore"
    FROM ai_tools
    WHERE
      ai_tools.name ILIKE $1 ESCAPE '\\'
      OR ai_tools.short_description ILIKE $1 ESCAPE '\\'
      OR COALESCE(ai_tools.long_description, '') ILIKE $1 ESCAPE '\\'
      OR EXISTS (
        SELECT 1 FROM ai_tool_tags
        WHERE ai_tool_tags.tool_id = ai_tools.id
          AND ai_tool_tags.tag_name ILIKE $1 ESCAPE '\\'
      )
      OR EXISTS (
        SELECT 1 FROM ai_tool_features
        WHERE ai_tool_features.tool_id = ai_tools.id
          AND ai_tool_features.feature_text ILIKE $1 ESCAPE '\\'
      )
      OR EXISTS (
        SELECT 1
        FROM ai_tool_categories
        INNER JOIN categories ON categories.id = ai_tool_categories.category_id
        WHERE ai_tool_categories.tool_id = ai_tools.id
          AND COALESCE(categories.source_name, '') ILIKE $1 ESCAPE '\\'
      )
    ORDER BY "matchScore" DESC, ai_tools.editorial_rating DESC NULLS LAST, ai_tools.name ASC
    LIMIT $2`,
    [likeQuery, limit],
  );

  return NextResponse.json({
    query,
    results: result.rows,
  });
}
