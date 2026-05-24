import "server-only";
import { getGeminiKey, getOpenAIKey } from "./server-config";

// LLM 호출 추상화.
// 우선순위: Gemini > OpenAI > null (mock 모드)
// 둘 다 없으면 null 반환 → 호출 측에서 mock 처리.

export async function callLLM(opts: {
  systemInstruction: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  const {
    systemInstruction,
    userPrompt,
    maxTokens = 500,
    temperature = 0.3,
  } = opts;

  const geminiKey = await getGeminiKey();
  if (geminiKey) {
    const r = await callGemini(geminiKey, systemInstruction, userPrompt, maxTokens, temperature);
    if (r !== null) return r;
    // Gemini가 실패해도 OpenAI fallback 시도하지 않음 (의도된 동작 - 일관성)
    return null;
  }

  const openaiKey = await getOpenAIKey();
  if (openaiKey) {
    return callOpenAI(openaiKey, systemInstruction, userPrompt, maxTokens, temperature);
  }

  return null;
}

// 어떤 LLM 이 활성화되어 있는지 (UI 표시용)
export async function getActiveProvider(): Promise<"gemini" | "openai" | "none"> {
  if (await getGeminiKey()) return "gemini";
  if (await getOpenAIKey()) return "openai";
  return "none";
}

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    });
    if (!resp.ok) {
      console.error("[llm/gemini] 응답 실패", { status: resp.status });
      return null;
    }
    const data = (await resp.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (err) {
    console.error("[llm/gemini] 예외", { message: (err as Error).message });
    return null;
  }
}

async function callOpenAI(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<string | null> {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!resp.ok) {
      console.error("[llm/openai] 응답 실패", { status: resp.status });
      return null;
    }
    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    console.error("[llm/openai] 예외", { message: (err as Error).message });
    return null;
  }
}
