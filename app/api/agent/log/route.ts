import { NextRequest, NextResponse } from "next/server";
import { getAgentLog } from "@/lib/agent";
import { HttpError, requireUser } from "@/lib/current-user";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const log = await getAgentLog(user.id, Number.isFinite(limit) ? limit : 50);
    return NextResponse.json({ log });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
