import { NextRequest, NextResponse } from "next/server";

import { purgeExpiredUnverifiedFirebaseUserByEmail } from "@/lib/server/firebase-admin";

type RegisterPreflightPayload = {
  email?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as RegisterPreflightPayload | null;
  const email = body?.email?.trim().toLowerCase() || "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  try {
    const result = await purgeExpiredUnverifiedFirebaseUserByEmail(email);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ code: "unknown" }, { status: 500 });
  }
}
