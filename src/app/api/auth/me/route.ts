import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);

  if (!user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
      emailVerified: user.email_verified,
    },
  });
}
