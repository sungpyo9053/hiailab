import { NextRequest, NextResponse } from "next/server";
import { getAgentLog } from "@/lib/agent";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const log = await getAgentLog(Number.isFinite(limit) ? limit : 50);
  return NextResponse.json({ log });
}
