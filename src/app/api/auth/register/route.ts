import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { getPool } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";

type RegisterPayload = {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as RegisterPayload | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password?.trim() ?? "";
  const username = body?.username?.trim() || null;
  const displayName = body?.displayName?.trim() || null;

  if (!email || !isValidEmail(email) || password.length < 6) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const pool = getPool();
  const existingUserResult = await pool.query(
    `SELECT id
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  if (existingUserResult.rows[0]) {
    return NextResponse.json({ code: "email_taken" }, { status: 409 });
  }

  const userId = randomUUID();

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
    ) VALUES ($1, $2, $3, $4, $5, 'user', 'pending_verification', FALSE)`,
    [userId, email, username, hashPassword(password), displayName],
  );

  const response = NextResponse.json({
    redirectTo: "/login",
    user: {
      id: userId,
      email,
      username,
      displayName,
    },
  });

  return response;
}
