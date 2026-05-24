import { NextResponse } from "next/server";
import { ensureLoopRunning, getAgentState } from "@/lib/agent-loop";
import { getAgentLog } from "@/lib/agent";

export const runtime = "nodejs";

export async function GET() {
  ensureLoopRunning();
  const state = await getAgentState();
  const log = await getAgentLog(50);
  return NextResponse.json({ state, log });
}
