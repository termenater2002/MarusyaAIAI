import { NextRequest, NextResponse } from "next/server";

import { searchToolsByUserQuery } from "@/lib/server/tool-search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ code: "validation", message: "Missing query" }, { status: 400 });
  }

  try {
    const result = await searchToolsByUserQuery(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        code: "unknown",
        message: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 },
    );
  }
}
