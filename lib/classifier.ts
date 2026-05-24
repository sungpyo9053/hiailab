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
  "응답은 다음 6개 라벨 중 정확히 하나만, 추가 설명 없이 한 단어로 출력한다.",
  "라벨: needs_reply, newsletter, promotion, notification, spam, other",
  "",
  "라벨 정의:",
  "- needs_reply: 사람(개인/업무)이 직접 보낸 메일로, 회신·답변·일정 협의·자료 요청·견적 문의 등 사람의 응답이 필요한 경우",
  "- newsletter: 정기 구독 발행물, 블로그 다이제스트, 매거진",
  "- promotion: 광고, 할인 쿠폰, 마케팅 캠페인, '[광고]' 표기, 이벤트 안내",
  "- notification: 시스템 자동 발송 알림 — 영수증/가입 인증/배송 알림/GitHub/LinkedIn/Slack 알림 등",
  "- spam: 분명한 스팸/피싱",
  "- other: 위 어디에도 해당하지 않거나 매우 애매한 경우",
  "",
  "원칙:",
  "1. 본문 내용을 가장 우선 판단. 발신자 도메인이 수신자와 같더라도(self-send) 본문이 회신 요청이면 needs_reply.",
  "2. 본문에 회신 요망 신호('가능한 시간 알려주세요', '회신 부탁드립니다', '의견 부탁합니다', '답변 부탁드립니다' 등)가 있으면 needs_reply.",
  "3. 발신자 이메일에 noreply/no-reply/notifications/invoice/statements 등 자동발송 키워드가 있으면 notification.",
  "4. 본문에 '[광고]', '구독 해지', '할인', '쿠폰', '이벤트' 같은 마케팅 키워드가 명확히 있으면 promotion.",
  "",
  "예시:",
  "[입력] From: 김민재 <kim@example.com>",
  "Subject: 다음 주 회의 일정 협의 부탁드립니다",
  "Body: 안녕하세요. 다음 주 화요일 오후 2시 또는 목요일 오전 10시에 회의 가능하실까요? 회신 부탁드립니다.",
  "[출력] needs_reply",
  "",
  "[입력] From: Anthropic, PBC <invoice+statements@mail.anthropic.com>",
  "Subject: Your receipt from Anthropic, PBC #2238-5565-0896",
  "Body: Thank you for your payment of $20...",
  "[출력] notification",
  "",
  "[입력] From: 쿠팡 이벤트 <event@coupang.com>",
  "Subject: 오늘만! 와우 회원에게 드리는 30% 추가 할인 쿠폰",
  "Body: [광고] 5만원 이상 결제 시 자동 적용...",
  "[출력] promotion",
  "",
  "[입력] From: LinkedIn <notifications-noreply@linkedin.com>",
  "Subject: 프로필이 인기를 끄는 중 - 검색 결과 노출: 1",
  "Body: 이번 주 검색 결과에 나타났습니다...",
  "[출력] notification",
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
        max_tokens: 30,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `[입력] ${userPrompt}\n[출력]` },
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
