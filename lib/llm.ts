import "server-only";
import { getGeminiKey, getGroqKey, getOpenAIKey } from "./server-config";

// LLM 호출 추상화.
// 우선순위: Groq (진짜 무료) > Gemini > OpenAI > null (mock)
// Groq 가 가장 무료 친화적이라 1순위. Gemini/OpenAI 는 결제 등록 필요.

export type LLMProvider = "groq" | "gemini" | "openai" | "none";

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

  const groqKey = await getGroqKey();
  if (groqKey) {
    return callGroq(groqKey, systemInstruction, userPrompt, maxTokens, temperature);
  }

  const geminiKey = await getGeminiKey();
  if (geminiKey) {
    return callGemini(geminiKey, systemInstruction, userPrompt, maxTokens, temperature);
  }

  const openaiKey = await getOpenAIKey();
  if (openaiKey) {
    return callOpenAI(openaiKey, systemInstruction, userPrompt, maxTokens, temperature);
  }

  return null;
}

export async function getActiveProvider(): Promise<LLMProvider> {
  if (await getGroqKey()) return "groq";
  if (await getGeminiKey()) return "gemini";
  if (await getOpenAIKey()) return "openai";
  return "none";
}

async function callGroq(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<string | null> {
  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!resp.ok) {
      console.error("[llm/groq] 응답 실패", { status: resp.status });
      return null;
    }
    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("[llm/groq] 예외", { message: (err as Error).message });
    return null;
  }
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
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });
    if (!resp.ok) {
      console.error("[llm/gemini] 응답 실패", { status: resp.status });
      return null;
    }
    const data = (await resp.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
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
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("[llm/openai] 예외", { message: (err as Error).message });
    return null;
  }
}
