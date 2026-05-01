import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { getSessionAccessError, getSessionUser } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";

type RouteContext = {
  params: Promise<{
    toolId: string;
  }>;
};

type RatingPayload = {
  rating?: number;
  reviewText?: string;
};

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { toolId } = await context.params;
  const numericToolId = Number(toolId);

  if (!Number.isFinite(numericToolId)) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const pool = getPool();
  const summaryResult = await pool.query(
    `SELECT
      ROUND(AVG(rating_value)::numeric, 2) AS "averageRating",
      COUNT(*)::int AS "totalRatings"
     FROM user_ratings
     WHERE tool_id = $1`,
    [numericToolId],
  );

  const user = await getSessionUser(request);
  let currentUserRating = null;

  if (user) {
    const currentRatingResult = await pool.query(
      `SELECT rating_value AS rating, review_text AS "reviewText"
       FROM user_ratings
       WHERE user_id = $1 AND tool_id = $2
       LIMIT 1`,
      [user.id, numericToolId],
    );
    currentUserRating = currentRatingResult.rows[0] ?? null;
  }

  const summaryRow = summaryResult.rows[0] as
    | {
        averageRating: unknown;
        totalRatings: unknown;
      }
    | undefined;

  return NextResponse.json({
    summary: {
      averageRating: toNullableNumber(summaryRow?.averageRating),
      totalRatings: Number(summaryRow?.totalRatings ?? 0),
    },
    currentUserRating: currentUserRating
      ? {
          rating: Number(currentUserRating.rating),
          reviewText: currentUserRating.reviewText ?? null,
        }
      : null,
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const user = await getSessionUser(request);
  const accessError = getSessionAccessError(user, { requireVerified: true });
  if (accessError) return accessError;
  const currentUser = user!;

  const { toolId } = await context.params;
  const numericToolId = Number(toolId);
  const body = (await request.json().catch(() => null)) as RatingPayload | null;
  const rating = Number(body?.rating);
  const reviewText = body?.reviewText?.trim() || null;

  if (!Number.isFinite(numericToolId) || !Number.isInteger(rating) || rating < 1 || rating > 10) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const pool = getPool();
  const toolResult = await pool.query("SELECT id FROM ai_tools WHERE id = $1 LIMIT 1", [numericToolId]);

  if (!toolResult.rows[0]) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  await pool.query(
    `INSERT INTO user_ratings (
      id,
      user_id,
      tool_id,
      rating_value,
      review_text
    ) VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, tool_id) DO UPDATE SET
      rating_value = EXCLUDED.rating_value,
      review_text = EXCLUDED.review_text,
      updated_at = NOW()`,
    [randomUUID(), currentUser.id, numericToolId, rating, reviewText],
  );

  return NextResponse.json({ ok: true, toolId: numericToolId, rating });
}
