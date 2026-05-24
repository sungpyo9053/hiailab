"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const USE_CASES = [
  {
    key: "personal",
    emoji: "👤",
    title: "개인 생산성",
    sub: "메일에 끌려다니지 않기",
    flow: [
      { e: "📥", t: "받은편지함 polling" },
      { e: "🏷️", t: "needs_reply 분류" },
      { e: "✍️", t: "답장 초안 생성" },
      { e: "✋", t: "본인 검토 후 발송" },
    ],
  },
  {
    key: "dev",
    emoji: "👨‍💻",
    title: "개발자",
    sub: "GitHub 알림 자동 정리",
    flow: [
      { e: "🔔", t: "GitHub notification 수신" },
      { e: "🎯", t: "PR review / issue 분류" },
      { e: "📌", t: "중요한 것만 Slack DM" },
      { e: "📊", t: "주간 활동 리포트" },
    ],
  },
  {
    key: "smb",
    emoji: "🏪",
    title: "소상공인",
    sub: "주문/문의 자동 응대",
    flow: [
      { e: "📧", t: "고객 문의 메일 수신" },
      { e: "🤖", t: "FAQ 자동 매칭" },
      { e: "📝", t: "맞춤 답장 초안" },
      { e: "✅", t: "사장님 한 번 보고 전송" },
    ],
  },
  {
    key: "team",
    emoji: "🧑‍🤝‍🧑",
    title: "팀 운영자",
    sub: "팀 메일 라우팅",
    flow: [
      { e: "📬", t: "팀 inbox 모니터링" },
      { e: "🏷️", t: "주제별 자동 분류" },
      { e: "👥", t: "담당자에게 자동 할당" },
      { e: "⏱️", t: "응답 SLA 추적" },
    ],
  },
];

export default function UseCaseSection() {
  const [active, setActive] = useState(USE_CASES[0].key);
  const activeCase = USE_CASES.find((c) => c.key === active)!;

  return (
    <section id="use-cases" className="relative bg-[var(--background-soft)] py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="bm-chip-warm">Use Cases</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            누가 이걸 쓰나요?
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-4">
          {USE_CASES.map((c) => {
            const isActive = c.key === active;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={
                  "rounded-xl border p-5 text-left transition " +
                  (isActive
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--background-elev)] hover:border-[var(--border-strong)]")
                }
              >
                <div className="text-[28px]">{c.emoji}</div>
                <div className={"mt-3 text-[15px] font-bold " + (isActive ? "text-[#a5b4fc]" : "text-[var(--foreground)]")}>
                  {c.title}
                </div>
                <div className="mt-1 text-[12px] text-[var(--foreground-muted)]">{c.sub}</div>
              </button>
            );
          })}
        </div>

        {/* 선택된 use case 플로우 */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bm-card p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="text-[28px]">{activeCase.emoji}</span>
                <div>
                  <div className="text-[16px] font-bold text-[var(--foreground)]">{activeCase.title}</div>
                  <div className="text-[12px] text-[var(--foreground-soft)]">자동화 플로우 예시</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {activeCase.flow.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--background-soft)] p-4 text-center">
                      <div className="text-[26px]">{step.e}</div>
                      <div className="mt-2 text-[11px] font-semibold text-[var(--foreground)]">{step.t}</div>
                      <div className="mt-1 mono text-[9px] text-[var(--foreground-muted)]">Step {i + 1}</div>
                    </div>
                    {i < activeCase.flow.length - 1 && (
                      <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 sm:block">
                        <span className="text-[18px] text-[var(--foreground-muted)]">→</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
