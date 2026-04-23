import { NextRequest, NextResponse } from "next/server";

import { getSessionAccessError, getSessionUser } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";

type FavoritePayload = {
  toolId?: number;
};

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  const accessError = getSessionAccessError(user, { requireVerified: true });
  if (accessError) return accessError;
  const currentUser = user!;

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
      user_favorites.created_at AS "favoritedAt"
    FROM user_favorites
    INNER JOIN ai_tools ON ai_tools.id = user_favorites.tool_id
    WHERE user_favorites.user_id = $1
    ORDER BY user_favorites.created_at DESC`,
    [currentUser.id],
  );

  return NextResponse.json({ items: result.rows });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  const accessError = getSessionAccessError(user, { requireVerified: true });
  if (accessError) return accessError;
  const currentUser = user!;

  const body = (await request.json().catch(() => null)) as FavoritePayload | null;
  const toolId = Number(body?.toolId);

  if (!Number.isFinite(toolId)) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const pool = getPool();
  const toolResult = await pool.query("SELECT id FROM ai_tools WHERE id = $1 LIMIT 1", [toolId]);

  if (!toolResult.rows[0]) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  await pool.query(
    `INSERT INTO user_favorites (user_id, tool_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, tool_id) DO NOTHING`,
    [currentUser.id, toolId],
  );

  return NextResponse.json({ ok: true, toolId });
}
