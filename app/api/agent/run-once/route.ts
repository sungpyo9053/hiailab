import { NextResponse } from "next/server";
import { triggerAgentRun, getAgentState } from "@/lib/agent-loop";

export const runtime = "nodejs";

export async function POST() {
  await triggerAgentRun();
  const state = await getAgentState();
  return NextResponse.json({ ok: true, state });
}
