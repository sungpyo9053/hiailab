import { NextRequest, NextResponse } from "next/server";
import { ensureLoopRunning, setAgentEnabled } from "@/lib/agent-loop";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { enabled?: boolean } = {};
  try {
    body = (await req.json()) as { enabled?: boolean };
  } catch {
    // 본문 없어도 OK
  }
  const enabled = Boolean(body.enabled);
  const s = await setAgentEnabled(enabled);
  ensureLoopRunning();
  return NextResponse.json({ ok: true, state: s });
}
