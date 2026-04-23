import { NextRequest, NextResponse } from "next/server";

import { getPool } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "30")));
  const offset = Math.max(0, Number(searchParams.get("offset") ?? "0"));
  const rawCategoryId = searchParams.get("categoryId");
  const categoryId =
    rawCategoryId && rawCategoryId !== "all" ? Number(rawCategoryId) : null;
  const freeOnly = searchParams.get("freeOnly") === "true";
  const worksInRussiaOnly = searchParams.get("worksInRussiaOnly") === "true";
  const sort = searchParams.get("sort") ?? "default";

  const whereClauses: string[] = [];
  const values: Array<number | boolean | string> = [];
  let valueIndex = 1;

  if (typeof categoryId === "number" && Number.isFinite(categoryId)) {
    whereClauses.push(
      `EXISTS (
        SELECT 1
        FROM ai_tool_categories
        WHERE ai_tool_categories.tool_id = ai_tools.id
          AND ai_tool_categories.category_id = $${valueIndex}
      )`,
    );
    values.push(categoryId);
    valueIndex += 1;
  }

  if (freeOnly) {
    whereClauses.push(`ai_tools.is_free = $${valueIndex}`);
    values.push(true);
    valueIndex += 1;
  }

  if (worksInRussiaOnly) {
    whereClauses.push(
      `EXISTS (
        SELECT 1
        FROM service_check_results
        WHERE service_check_results.tool_id = ai_tools.id
          AND service_check_results.ok = TRUE
          AND service_check_results.run_id = (
            SELECT id
            FROM service_check_runs
            ORDER BY checked_at DESC
            LIMIT 1
          )
      )`,
    );
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  let orderBySql = "ORDER BY ai_tools.id";
  if (sort === "name-asc") {
    orderBySql = 'ORDER BY ai_tools.name ASC, ai_tools.id ASC';
  } else if (sort === "rating-desc") {
    orderBySql =
      'ORDER BY ai_tools.editorial_rating DESC NULLS LAST, ai_tools.name ASC, ai_tools.id ASC';
  }

  const pool = getPool();
  const itemsResult = await pool.query(
    `SELECT
      id,
      name,
      entity_type AS "entityType",
      url,
      image_url AS "imageUrl",
      short_description AS description,
      editorial_rating AS "editorialRating",
      works_in_russia AS "worksInRussia",
      needs_vpn AS "needsVPN",
      requires_registration AS "requiresRegistration",
      is_free AS "isFree",
      COALESCE((
        SELECT json_agg(tag_name ORDER BY tag_name)
        FROM ai_tool_tags
        WHERE ai_tool_tags.tool_id = ai_tools.id
      ), '[]'::json) AS tags
    FROM ai_tools
    ${whereSql}
    ${orderBySql}
    LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`,
    [...values, limit, offset],
  );

  const totalResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM ai_tools
     ${whereSql}`,
    values,
  );

  return NextResponse.json({
    items: itemsResult.rows,
    pagination: {
      total: Number(totalResult.rows[0]?.count ?? 0),
      limit,
      offset,
    },
    filters: {
      categoryId,
      freeOnly,
      worksInRussiaOnly,
      sort,
    },
  });
}
