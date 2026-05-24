import { NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents";
import { getAllActivations } from "@/lib/agents-store";
import { isGmailConnected, getConnectedEmail } from "@/lib/gmail";
import { getActiveProvider } from "@/lib/llm";

export const runtime = "nodejs";

// 카탈로그 전체 + 활성화 상태 + 사전 조건(prerequisites) 충족 여부 통합.
export async function GET() {
  const [activations, gmailConn, gmailEmail, aiProvider] = await Promise.all([
    getAllActivations(),
    isGmailConnected(),
    getConnectedEmail(),
    getActiveProvider(),
  ]);

  const prereq = {
    gmail_oauth: gmailConn,
    ai_key: aiProvider !== "none",
    // 아직 구현 안 된 것들
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
    accountInfo: {
      gmailEmail,
      aiProvider,
    },
  });
}
