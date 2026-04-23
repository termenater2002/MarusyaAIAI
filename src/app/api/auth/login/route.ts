import { NextRequest, NextResponse } from "next/server";

import { createSession, SESSION_COOKIE_NAME } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/password";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as LoginPayload | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const pool = getPool();
  const result = await pool.query<{
    id: string;
    email: string;
    username: string | null;
    password_hash: string;
    role: string;
    status: string;
    email_verified: boolean;
  }>(
    `SELECT id, email, username, password_hash, role, status, email_verified
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  const user = result.rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ code: "invalid_credentials" }, { status: 401 });
  }

  if (user.status === "blocked") {
    return NextResponse.json({ code: "blocked" }, { status: 401 });
  }

  if (user.status === "pending_verification" || !user.email_verified) {
    return NextResponse.json({ code: "unverified" }, { status: 423 });
  }

  const session = await createSession(user.id, {
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const response = NextResponse.json({
    redirectTo: "/",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
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
