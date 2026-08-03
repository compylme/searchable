import { NextRequest, NextResponse } from "next/server";

const SUPABASE_TRACK_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track`;

export async function POST(request: NextRequest) {
  const body = await request.text();

  const upstream = await fetch(SUPABASE_TRACK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": request.headers.get("user-agent") ?? "",
      "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
    },
    body,
  });

  return NextResponse.json(await upstream.json(), {
    status: upstream.status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
