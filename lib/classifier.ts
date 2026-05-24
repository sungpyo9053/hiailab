import "server-only";
import { getOpenAIKey } from "./server-config";

// 받은 메일이 "답장 필요"인지 분류. OpenAI 미설정 시 보수적으로 needs_reply 처리는 하지 않고 skip.

export type MailCategory =
  | "needs_reply" // 사람이 보낸 개인/업무 메일, 답장 필요
  | "newsletter" // 뉴스레터/구독 메일
  | "promotion" // 광고/프로모션
  | "notification" // 시스템 알림/자동 발송 (Github, Slack, 결제 영수증 등)
  | "spam"
  | "other";

const SYSTEM_PROMPT = [
  "당신은 받은편지함 메일을 분류하는 분류기다.",
  "다음 6가지 중 정확히 하나로만 응답한다. 다른 텍스트나 설명은 절대 출력하지 않는다.",
  "needs_reply | newsletter | promotion | notification | spam | other",
  "",
  "기준:",
  "- needs_reply: 사람(개인/업무)이 직접 보낸 질문/요청/회신 요망 메일",
  "- newsletter: 정기 구독 발행물, 블로그 다이제스트, 매거진",
  "- promotion: 광고, 할인, 쿠폰, 마케팅 캠페인",
  "- notification: 자동 발송된 시스템 알림 (영수증, 가입 인증, 배송 알림, GitHub/Slack 알림 등)",
  "- spam: 분명한 스팸/피싱",
  "- other: 위 카테고리에 해당하지 않거나 판단이 어려운 경우",
  "",
  "원칙: 답장이 필요할지 애매하면 needs_reply 대신 other 를 선택한다. (잘못된 자동 답장 초안 생성을 줄이기 위함)",
].join("\n");

export async function classifyMail(input: {
  from: string;
  subject: string;
  bodyPreview: string; // 본문 앞부분 (500자 정도)
}): Promise<MailCategory> {
  const key = await getOpenAIKey();
  if (!key) return "other"; // 키가 없으면 분류 불가 → 답장 생성 안 함

  const userPrompt = [
    `From: ${input.from}`,
    `Subject: ${input.subject}`,
    "",
    "Body preview:",
    input.bodyPreview.slice(0, 600),
  ].join("\n");

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 5,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!resp.ok) {
      console.error("[classifier] OpenAI 응답 실패", { status: resp.status });
      return "other";
    }
    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = (data.choices?.[0]?.message?.content ?? "").trim().toLowerCase();
    const valid: MailCategory[] = [
      "needs_reply",
      "newsletter",
      "promotion",
      "notification",
      "spam",
      "other",
    ];
    return (valid.find((c) => raw.includes(c)) ?? "other") as MailCategory;
  } catch (err) {
    console.error("[classifier] 예외", { message: (err as Error).message });
    return "other";
  }
}
