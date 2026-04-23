import { createHash, randomBytes, randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { getPool } from "@/lib/server/db";

type RecoveryPayload = {
  email?: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as RecoveryPayload | null;
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const pool = getPool();
  const userResult = await pool.query<{ id: string }>(
    `SELECT id
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  const user = userResult.rows[0];

  if (user) {
    const rawToken = randomBytes(24).toString("hex");
    await pool.query(
      `INSERT INTO password_reset_tokens (
        id,
        user_id,
        token_hash,
        expires_at
      ) VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
      [randomUUID(), user.id, hashToken(rawToken)],
    );
  }

  return NextResponse.json({
    message: "Если аккаунт найден, мы отправили инструкции по восстановлению",
  });
}
