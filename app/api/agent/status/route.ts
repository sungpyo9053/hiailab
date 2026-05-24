import { NextResponse } from "next/server";
import { getAgentLog } from "@/lib/agent";
import { ensureLoopRunning, getAgentState } from "@/lib/agent-loop";
import { HttpError, requireUser } from "@/lib/current-user";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    ensureLoopRunning();
    const [state, log] = await Promise.all([
      getAgentState(user.id),
      getAgentLog(user.id, 50),
    ]);
    return NextResponse.json({ state, log });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
