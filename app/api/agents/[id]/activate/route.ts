import { NextRequest, NextResponse } from "next/server";
import { findAgent } from "@/lib/agents";
import { setAgentEnabledState } from "@/lib/agents-store";
import { ensureLoopRunning, setAgentEnabled as setLegacyAgentEnabled } from "@/lib/agent-loop";

export const runtime = "nodejs";

// POST: 에이전트 활성화 (또는 비활성화 - body: { enabled: boolean })
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const meta = findAgent(id);
  if (!meta) {
    return NextResponse.json({ ok: false, error: "알 수 없는 에이전트입니다." }, { status: 404 });
  }
  if (meta.status === "coming_soon") {
    return NextResponse.json(
      { ok: false, error: "이 에이전트는 아직 준비 중입니다." },
      { status: 400 }
    );
  }

  let body: { enabled?: boolean } = { enabled: true };
  try {
    body = (await req.json()) as { enabled?: boolean };
  } catch {
    // 본문 없으면 default true
  }
  const enabled = body.enabled !== false;

  const activation = await setAgentEnabledState(id, enabled);

  // email-reply 의 경우 기존 agent-loop 활성화 토글과 연동
  if (id === "email-reply") {
    await setLegacyAgentEnabled(enabled);
    ensureLoopRunning();
  }

  return NextResponse.json({ ok: true, activation });
}
