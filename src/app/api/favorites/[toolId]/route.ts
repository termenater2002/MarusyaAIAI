import { NextRequest, NextResponse } from "next/server";

import { getSessionAccessError, getSessionUser } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";

type RouteContext = {
  params: Promise<{
    toolId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser(request);
  const accessError = getSessionAccessError(user, { requireVerified: true });
  if (accessError) return accessError;
  const currentUser = user!;

  const { toolId } = await context.params;
  const numericToolId = Number(toolId);

  if (!Number.isFinite(numericToolId)) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const pool = getPool();
  const result = await pool.query(
    `SELECT 1
     FROM user_favorites
     WHERE user_id = $1 AND tool_id = $2
     LIMIT 1`,
    [currentUser.id, numericToolId],
  );

  return NextResponse.json({
    favorited: Boolean(result.rows[0]),
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser(request);
  const accessError = getSessionAccessError(user, { requireVerified: true });
  if (accessError) return accessError;
  const currentUser = user!;

  const { toolId } = await context.params;
  const numericToolId = Number(toolId);

  if (!Number.isFinite(numericToolId)) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const pool = getPool();
  await pool.query(
    `DELETE FROM user_favorites
     WHERE user_id = $1 AND tool_id = $2`,
    [currentUser.id, numericToolId],
  );

  return NextResponse.json({ ok: true, toolId: numericToolId });
}
