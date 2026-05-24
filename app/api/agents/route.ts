import { NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents";
import { getAllActivations } from "@/lib/agents-store";
import { HttpError, requireUser } from "@/lib/current-user";
import { getConnectedEmail, isGmailConnected } from "@/lib/gmail";
import { getActiveProvider } from "@/lib/llm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const [activations, gmailConn, gmailEmail, aiProvider] = await Promise.all([
      getAllActivations(user.id),
      isGmailConnected(user.id),
      getConnectedEmail(user.id),
      getActiveProvider(),
    ]);

    const prereq = {
      gmail_oauth: gmailConn,
      ai_key: aiProvider !== "none",
      calendar_oauth: false,
      smtp: false,
      kakao: false,
      slack: false,
    };

    const items = AGENTS.map((a) => {
      const activation = activations[a.id];
      const allReqsMet = a.requirements
        .filter((r) => r.required)
        .every((r) => prereq[r.key]);
      return {
        ...a,
        activation: activation ?? null,
        prereqMet: allReqsMet,
        missingPrereqs: a.requirements
          .filter((r) => r.required && !prereq[r.key])
          .map((r) => r.label),
      };
    });

    return NextResponse.json({
      agents: items,
      accountInfo: { gmailEmail, aiProvider },
      user: { email: user.email, role: user.role, mode: user.mode },
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
