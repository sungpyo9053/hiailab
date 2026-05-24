import { NextResponse } from "next/server";
import { getOpenAIKey } from "@/lib/server-config";

export const runtime = "nodejs";

// 저장된 키 또는 env의 키로 가벼운 인증 테스트.
// GET /v1/models 를 사용 — 토큰 소비 없음 + 키 유효성 검증 가능.
export async function POST() {
  const key = await getOpenAIKey();
  if (!key) {
    return NextResponse.json({
      ok: true,
      mode: "mock",
      message:
        "OpenAI 키가 설정되지 않아 MOCK 모드입니다. 실제 호출은 수행되지 않았습니다.",
    });
  }
  try {
    const resp = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    });
    if (resp.status === 401) {
      return NextResponse.json(
        {
          ok: false,
          mode: "real",
          error: "OpenAI 키가 거부되었습니다 (401). 키를 다시 확인하세요.",
        },
        { status: 400 }
      );
    }
    if (!resp.ok) {
      return NextResponse.json(
        {
          ok: false,
          mode: "real",
          error: `OpenAI 응답 실패 (status ${resp.status})`,
        },
        { status: 502 }
      );
    }
    return NextResponse.json({
      ok: true,
      mode: "real",
      message: "OpenAI 연결 OK",
    });
  } catch (err) {
    const safe = (err as Error).message?.split("\n")[0] ?? "네트워크 오류";
    return NextResponse.json(
      { ok: false, mode: "real", error: `OpenAI 호출 실패: ${safe}` },
      { status: 500 }
    );
  }
}
