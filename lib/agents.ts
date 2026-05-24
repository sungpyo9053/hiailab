// 에이전트 카탈로그 — 클라이언트/서버 공용 메타데이터.
// 새 에이전트 추가하려면 여기 등록 + lib/agents-store.ts 활성화 키 + 실제 동작 로직.

export type AgentStatus = "available" | "coming_soon";

export type AgentRequirement = {
  label: string;
  key: "gmail_oauth" | "ai_key" | "smtp" | "kakao" | "calendar_oauth" | "slack";
  required: boolean;
};

export type AgentMeta = {
  id: string;
  name: string;
  emoji: string;
  tagline: string; // 한 줄 요약
  description: string; // 상세
  status: AgentStatus;
  requirements: AgentRequirement[];
  category: "email" | "meeting" | "schedule" | "writing";
};

export const AGENTS: AgentMeta[] = [
  {
    id: "email-reply",
    name: "메일 자동 답장",
    emoji: "✉️",
    tagline: "받은 메일에 AI가 답장 초안을 임시보관함에 자동 작성",
    description:
      "Gmail 받은편지함을 5분마다 확인해 답장이 필요한 메일만 AI가 골라, 정중한 답장 초안을 Gmail 임시보관함에 자동으로 만들어 둡니다. 자동 발송은 하지 않습니다.",
    status: "available",
    category: "email",
    requirements: [
      { label: "Gmail 연결", key: "gmail_oauth", required: true },
      { label: "AI 키 (Groq 무료 / Gemini / OpenAI 중 1개)", key: "ai_key", required: true },
    ],
  },
  {
    id: "meeting-summary",
    name: "회의록 자동 정리",
    emoji: "📝",
    tagline: "Google Meet 녹취를 요약·결정사항·할 일로 자동 정리",
    description:
      "Google Meet 자동 녹취를 가져와 핵심 요약 + 결정사항 + 담당자별 액션 아이템으로 정리해서 본인 이메일로 보내드립니다.",
    status: "coming_soon",
    category: "meeting",
    requirements: [
      { label: "Google Meet/Drive 연결", key: "calendar_oauth", required: true },
      { label: "AI 키", key: "ai_key", required: true },
    ],
  },
  {
    id: "schedule-coordinator",
    name: "일정 자동 조율",
    emoji: "📅",
    tagline: "메일에 회의 일정 요청 오면 가능한 시간 자동 제안",
    description:
      "받은 메일에 일정 협의 요청이 있으면 본인 캘린더와 비교해서 비어있는 시간을 자동으로 찾아 답장 초안에 포함합니다.",
    status: "coming_soon",
    category: "schedule",
    requirements: [
      { label: "Gmail 연결", key: "gmail_oauth", required: true },
      { label: "Google Calendar 연결", key: "calendar_oauth", required: true },
      { label: "AI 키", key: "ai_key", required: true },
    ],
  },
  {
    id: "promo-cleaner",
    name: "광고 메일 자동 정리",
    emoji: "🧹",
    tagline: "광고/뉴스레터를 라벨로 분류 + 일괄 보관",
    description:
      "받은편지함의 광고·프로모션·뉴스레터를 AI가 분류해서 별도 라벨로 이동시키거나 보관 처리. 받은편지함이 항상 깨끗합니다.",
    status: "coming_soon",
    category: "email",
    requirements: [
      { label: "Gmail 연결 (modify 권한)", key: "gmail_oauth", required: true },
      { label: "AI 키", key: "ai_key", required: true },
    ],
  },
];

export function findAgent(id: string): AgentMeta | undefined {
  return AGENTS.find((a) => a.id === id);
}

// 카테고리별 한국어 라벨 (UI에서 사용)
export const CATEGORY_LABEL: Record<AgentMeta["category"], string> = {
  email: "이메일",
  meeting: "회의",
  schedule: "일정",
  writing: "작성",
};
