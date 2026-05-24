// 클라이언트/서버 공용 메타데이터.
// 주의: 실제 system prompt 는 lib/prompts.ts (server-only) 에만 둔다.
export type GeneratorMeta = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  inputLabel: string;
  placeholder: string;
};

export const GENERATORS: GeneratorMeta[] = [
  {
    id: "email-reply",
    name: "답장 자판기",
    emoji: "✉️",
    description:
      "애매한 메일을 붙여넣으면 바로 보낼 수 있는 정중한 답장을 뽑아드립니다.",
    inputLabel: "받은 이메일 본문",
    placeholder:
      "여기에 받은 이메일을 그대로 붙여넣으세요…\n\n예) 안녕하세요, 다음 주 미팅 일정을 잡고 싶은데 가능한 시간을 알려주세요.",
  },
  {
    id: "meeting-summary",
    name: "회의록 자판기",
    emoji: "📝",
    description:
      "회의 메모를 넣으면 요약·결정사항·담당자별 할 일을 정리해드립니다.",
    inputLabel: "회의 메모 / 녹취 텍스트",
    placeholder:
      "회의 내용을 자유롭게 붙여넣으세요…\n\n예) - 출시 일정 4월 첫 주로 확정\n- A는 디자인, B는 백엔드 담당\n- 가격 정책은 다음 주 결정",
  },
  {
    id: "product-copy",
    name: "카피 자판기",
    emoji: "🛍️",
    description:
      "상품명과 장점만 넣으면 상세페이지·인스타·광고 문구를 뽑아드립니다.",
    inputLabel: "상품명 + 핵심 장점",
    placeholder:
      "예) 무선 이어폰, 노이즈 캔슬링, 30시간 배터리, 1만원대 가성비",
  },
];

export function findGenerator(id: string): GeneratorMeta | undefined {
  return GENERATORS.find((g) => g.id === id);
}
