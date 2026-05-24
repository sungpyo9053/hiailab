import { NextRequest, NextResponse } from "next/server";
import { findAgent } from "@/lib/agents";
import { setAgentEnabledState } from "@/lib/agents-store";
import { ensureLoopRunning, setAgentEnabled as setLegacyAgentEnabled } from "@/lib/agent-loop";
import { HttpError, requireUser } from "@/lib/current-user";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
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
      // ignore
    }
    const enabled = body.enabled !== false;

    const activation = await setAgentEnabledState(user.id, id, enabled);

    if (id === "email-reply") {
      await setLegacyAgentEnabled(user.id, enabled);
      ensureLoopRunning();
    }

    return NextResponse.json({ ok: true, activation });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
