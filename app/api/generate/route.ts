import { NextRequest, NextResponse } from "next/server";
import { findGenerator } from "@/lib/generators";
import { getMockResult } from "@/lib/mocks";
import { getPromptForGenerator } from "@/lib/prompts";
import { getOpenAIKey } from "@/lib/server-config";

export const runtime = "nodejs";

type GenerateBody = {
  generatorId?: string;
  input?: string;
};

export async function POST(req: NextRequest) {
  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청 본문입니다." },
      { status: 400 }
    );
  }

  const generatorId = (body.generatorId ?? "").trim();
  const input = (body.input ?? "").trim();

  if (!generatorId || !input) {
    return NextResponse.json(
      { ok: false, error: "generatorId와 input은 필수입니다." },
      { status: 400 }
    );
  }

  const meta = findGenerator(generatorId);
  const prompt = getPromptForGenerator(generatorId);
  if (!meta || !prompt) {
    return NextResponse.json(
      { ok: false, error: "알 수 없는 생성기입니다." },
      { status: 400 }
    );
  }

  const apiKey = await getOpenAIKey();

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      mode: "mock",
      generatorId,
      generatorName: meta.name,
      result: getMockResult(generatorId),
    });
  }

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.userTemplate(input) },
        ],
      }),
    });

    if (!resp.ok) {
      const status = resp.status;
      console.error("[generate] OpenAI 응답 실패", { status });
      return NextResponse.json(
        { ok: false, error: `AI 호출 실패 (status ${status})` },
        { status: 502 }
      );
    }

    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json(
        { ok: false, error: "AI 응답이 비어 있습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "real",
      generatorId,
      generatorName: meta.name,
      result: text,
    });
  } catch (err) {
    console.error("[generate] 예외 발생", { message: (err as Error).message });
    return NextResponse.json(
      { ok: false, error: "AI 호출 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
