import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function getSafeImageUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rawSrc = request.nextUrl.searchParams.get("src")?.trim();

  if (!rawSrc) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  const targetUrl = getSafeImageUrl(rawSrc);
  if (!targetUrl) {
    return NextResponse.json({ code: "validation" }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 MarusyaAIImageProxy/1.0",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      cache: "force-cache",
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json({ code: "upstream_failed" }, { status: upstreamResponse.status });
    }

    const contentType = upstreamResponse.headers.get("content-type") || "image/png";
    const arrayBuffer = await upstreamResponse.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ code: "upstream_failed" }, { status: 502 });
  }
}
