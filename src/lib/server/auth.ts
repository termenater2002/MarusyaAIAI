import { createHash, randomBytes, randomUUID } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { getPool } from "@/lib/server/db";

export const SESSION_COOKIE_NAME = "marusya_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  role: string;
  status: string;
  email_verified: boolean;
};

type SessionAccessOptions = {
  requireVerified?: boolean;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  meta?: { ipAddress?: string | null; userAgent?: string | null },
) {
  const pool = getPool();
  const sessionId = randomUUID();
  const token = randomBytes(32).toString("hex");

  await pool.query(
    `INSERT INTO auth_sessions (
      id,
      user_id,
      refresh_token_hash,
      ip_address,
      user_agent,
      expires_at
    ) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 days')`,
    [sessionId, userId, hashToken(token), meta?.ipAddress ?? null, meta?.userAgent ?? null],
  );

  await pool.query(
    `UPDATE users
     SET last_login_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [userId],
  );

  return {
    token,
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function revokeSession(token: string) {
  const pool = getPool();
  await pool.query(
    `UPDATE auth_sessions
     SET revoked_at = NOW()
     WHERE refresh_token_hash = $1`,
    [hashToken(token)],
  );
}

export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const pool = getPool();
  const result = await pool.query<SessionUser>(
    `SELECT
      users.id,
      users.email,
      users.username,
      users.display_name,
      users.role,
      users.status,
      users.email_verified
    FROM auth_sessions
    INNER JOIN users ON users.id = auth_sessions.user_id
    WHERE auth_sessions.refresh_token_hash = $1
      AND auth_sessions.revoked_at IS NULL
      AND auth_sessions.expires_at > NOW()
    LIMIT 1`,
    [hashToken(token)],
  );

  return result.rows[0] ?? null;
}

export function getSessionAccessError(
  user: SessionUser | null,
  options?: SessionAccessOptions,
) {
  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  if (options?.requireVerified && !user.email_verified) {
    return NextResponse.json(
      {
        code: "email_unverified",
        message: "Подтвердите почту, чтобы пользоваться этой функцией.",
      },
      { status: 423 },
    );
  }

  return null;
}
