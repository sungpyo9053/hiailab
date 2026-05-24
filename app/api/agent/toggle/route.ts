import { NextRequest, NextResponse } from "next/server";
import { ensureLoopRunning, setAgentEnabled } from "@/lib/agent-loop";
import { HttpError, requireUser } from "@/lib/current-user";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    let body: { enabled?: boolean } = {};
    try {
      body = (await req.json()) as { enabled?: boolean };
    } catch {
      // ignore
    }
    const enabled = Boolean(body.enabled);
    const s = await setAgentEnabled(user.id, enabled);
    ensureLoopRunning();
    return NextResponse.json({ ok: true, state: s });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
