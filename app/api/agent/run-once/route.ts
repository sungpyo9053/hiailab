import { NextResponse } from "next/server";
import { getAgentState, triggerAgentRun } from "@/lib/agent-loop";
import { HttpError, requireUser } from "@/lib/current-user";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await requireUser();
    await triggerAgentRun(user.id);
    const state = await getAgentState(user.id);
    return NextResponse.json({ ok: true, state });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
