import { NextResponse } from "next/server";

import { getPool } from "@/lib/server/db";

function escapeCsv(value: unknown) {
  const stringValue = value == null ? "" : String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET() {
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
        SELECT string_agg(tag_name, ', ' ORDER BY tag_name)
        FROM ai_tool_tags
        WHERE ai_tool_tags.tool_id = ai_tools.id
      ), '') AS tags,
      COALESCE((
        SELECT string_agg(feature_text, ' | ' ORDER BY position_index)
        FROM ai_tool_features
        WHERE ai_tool_features.tool_id = ai_tools.id
      ), '') AS features,
      COALESCE((
        SELECT string_agg(COALESCE(categories.source_name, categories.id::text), ', ' ORDER BY categories.id)
        FROM ai_tool_categories
        INNER JOIN categories ON categories.id = ai_tool_categories.category_id
        WHERE ai_tool_categories.tool_id = ai_tools.id
      ), '') AS categories
    FROM ai_tools
    ORDER BY ai_tools.id`,
  );

  const header = [
    "id",
    "name",
    "entityType",
    "url",
    "imageUrl",
    "description",
    "longDescription",
    "editorialRating",
    "worksInRussia",
    "needsVPN",
    "requiresRegistration",
    "isFree",
    "tags",
    "features",
    "categories",
  ];

  const lines = [
    header.map(escapeCsv).join(","),
    ...result.rows.map((row) =>
      [
        row.id,
        row.name,
        row.entityType,
        row.url,
        row.imageUrl,
        row.description,
        row.longDescription,
        row.editorialRating,
        row.worksInRussia,
        row.needsVPN,
        row.requiresRegistration,
        row.isFree,
        row.tags,
        row.features,
        row.categories,
      ].map(escapeCsv).join(","),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="marusya-tools.csv"',
      "Cache-Control": "no-store",
    },
  });
}
