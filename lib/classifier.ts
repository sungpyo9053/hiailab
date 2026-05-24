import "server-only";
import { callLLM } from "./llm";

export type MailCategory =
  | "needs_reply"
  | "newsletter"
  | "promotion"
  | "notification"
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
  "2. 본문에 회신 요망 신호('가능한 시간 알려주세요', '회신 부탁드립니다', '의견 부탁합니다' 등)가 있으면 needs_reply.",
  "3. 발신자 이메일에 noreply/no-reply/notifications/invoice/statements 등 자동발송 키워드가 있으면 notification.",
  "4. 본문에 '[광고]', '구독 해지', '할인', '쿠폰', '이벤트' 같은 마케팅 키워드가 명확히 있으면 promotion.",
  "",
  "예시:",
  "[입력] From: 김민재 <kim@example.com>",
  "Subject: 다음 주 회의 일정 협의 부탁드립니다",
  "Body: 다음 주 화요일 오후 2시 가능하실까요? 회신 부탁드립니다.",
  "[출력] needs_reply",
  "",
  "[입력] From: Anthropic <invoice@anthropic.com>",
  "Subject: Your receipt",
  "Body: Thank you for your payment...",
  "[출력] notification",
  "",
  "[입력] From: 쿠팡 <event@coupang.com>",
  "Subject: 30% 할인 쿠폰",
  "Body: [광고] 5만원 이상 결제 시...",
  "[출력] promotion",
  "",
  "[입력] From: LinkedIn <notifications-noreply@linkedin.com>",
  "Subject: 검색 결과 노출",
  "[출력] notification",
].join("\n");

export async function classifyMail(input: {
  from: string;
  subject: string;
  bodyPreview: string;
}): Promise<MailCategory> {
  const userPrompt = [
    "[입력]",
    `From: ${input.from}`,
    `Subject: ${input.subject}`,
    "",
    "Body:",
    input.bodyPreview.slice(0, 600),
    "",
    "[출력]",
  ].join("\n");

  const raw = await callLLM({
    systemInstruction: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 30,
    temperature: 0,
  });

  if (!raw) return "other"; // LLM 미설정 또는 호출 실패

  const lowered = raw.toLowerCase();
  const valid: MailCategory[] = [
    "needs_reply",
    "newsletter",
    "promotion",
    "notification",
    "spam",
    "other",
  ];
  return (valid.find((c) => lowered.includes(c)) ?? "other") as MailCategory;
}
