import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { createSession, SESSION_COOKIE_NAME } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";
import { lookupFirebaseUser } from "@/lib/server/firebase-auth";
import { hashPassword } from "@/lib/server/password";

type SessionPayload = {
  idToken?: string;
  email?: string;
  displayName?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as SessionPayload | null;
  const idToken = body?.idToken?.trim();

  if (!idToken) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  let firebaseUser;

  try {
    firebaseUser = await lookupFirebaseUser(idToken);
  } catch {
    return NextResponse.json({ code: "unknown" }, { status: 500 });
  }

  if (!firebaseUser?.email) {
    return NextResponse.json({ code: "invalid_credentials" }, { status: 401 });
  }

  if (firebaseUser.disabled) {
    return NextResponse.json({ code: "blocked" }, { status: 423 });
  }

  const email = firebaseUser.email.trim().toLowerCase();
  const displayName = body?.displayName?.trim() || firebaseUser.displayName?.trim() || null;
  const emailVerified = Boolean(firebaseUser.emailVerified);
  const pool = getPool();

  const existingUserResult = await pool.query<{
    id: string;
    status: string;
  }>(
    `SELECT id, status
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  let userId = existingUserResult.rows[0]?.id;
  const currentStatus = existingUserResult.rows[0]?.status;

  if (currentStatus === "blocked") {
    return NextResponse.json({ code: "blocked" }, { status: 403 });
  }

  if (!userId) {
    userId = randomUUID();

    await pool.query(
      `INSERT INTO users (
        id,
        email,
        username,
        password_hash,
        display_name,
        role,
        status,
        email_verified
      ) VALUES ($1, $2, NULL, $3, $4, 'user', $5, $6)`,
      [
        userId,
        email,
        hashPassword(randomUUID()),
        displayName,
        emailVerified ? "active" : "pending_verification",
        emailVerified,
      ],
    );
  } else {
    await pool.query(
      `UPDATE users
       SET display_name = COALESCE($2, display_name),
           email_verified = $3,
           status = CASE
             WHEN status = 'blocked' THEN status
             WHEN $3 THEN 'active'
             ELSE 'pending_verification'
           END,
           updated_at = NOW()
       WHERE id = $1`,
      [userId, displayName, emailVerified],
    );
  }

  if (!emailVerified) {
    return NextResponse.json({ code: "unverified" }, { status: 423 });
  }

  const session = await createSession(userId, {
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const response = NextResponse.json({
    redirectTo: "/",
    user: {
      id: userId,
      email,
      displayName,
      emailVerified,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: session.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge,
  });

  return response;
}
