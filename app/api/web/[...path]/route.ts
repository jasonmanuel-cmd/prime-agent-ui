import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.LEAD_SCORING_API_URL || "http://127.0.0.1:8082";

export async function POST(req: NextRequest) {
  const url = new URL(req.nextUrl);
  const path = url.pathname.replace("/api/", "");
  const body = await req.json().catch(() => ({}));

  try {
    const res = await fetch(`${API_BASE}/web/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "API proxy failed — check API server" }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.nextUrl);
  const path = url.pathname.replace("/api/", "");

  try {
    const res = await fetch(`${API_BASE}/${path}`);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "API proxy failed — check API server" }, { status: 502 });
  }
}
