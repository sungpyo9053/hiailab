"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type UseCase = {
  key: string;
  title: string;
  sub: string;
  agents: string[];
};

const USE_CASES: UseCase[] = [
  {
    key: "personal",
    title: "개인 생산성",
    sub: "흩어진 inbox 통합",
    agents: ["메일 요약", "중요 메일 분류", "일정 감지", "Slack 알림 정리", "일간 요약"],
  },
  {
    key: "dev",
    title: "개발자",
    sub: "알림과 문서 자동 정리",
    agents: ["GitHub 알림 정리", "장애 알림 요약", "PDF/문서 요약", "주간 활동 리포트", "실행 로그 리포트"],
  },
  {
    key: "smb",
    title: "소상공인",
    sub: "고객 응대와 데이터 정리",
    agents: ["메일 분류", "답장 초안 생성", "CSV/엑셀 정리", "중복 제거", "주간 매출 리포트"],
  },
  {
    key: "team",
    title: "팀 운영자",
    sub: "팀 inbox와 리포트 자동화",
    agents: ["팀 메일 라우팅", "회의 리마인드", "캘린더 정리", "자동 보고서 생성", "Slack 다이제스트"],
  },
];

export default function UseCaseSection() {
  const [active, setActive] = useState(USE_CASES[0].key);
  const activeCase = USE_CASES.find((c) => c.key === active)!;

  return (
    <section id="use-cases" className="relative py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="bm-chip-hot">Use Cases</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            누가, 어떻게 조합하나요?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-[var(--foreground-soft)] sm:text-[16px]">
            카테고리별 에이전트를 자유롭게 조합해서 본인 워크플로우를 만드세요.
          </p>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-4">
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
                <div
                  className={
                    "text-[15px] font-bold " +
                    (isActive ? "text-[#a5b4fc]" : "text-[var(--foreground)]")
                  }
                >
                  {c.title}
                </div>
                <div className="mt-1 text-[12px] text-[var(--foreground-muted)]">{c.sub}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bm-card p-8"
            >
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-wider text-[var(--accent)]">
                  추천 조합
                </div>
                <div className="mt-1 text-[20px] font-bold text-[var(--foreground)]">
                  {activeCase.title} · {activeCase.sub}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCase.agents.map((agent, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background-soft)] px-3 py-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    <span className="text-[12px] text-[var(--foreground)]">{agent}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-[var(--border-soft)] bg-[var(--background-soft)] p-4 mono text-[11px] text-[var(--foreground-soft)]">
                {activeCase.agents.length} agents activated · running in your environment
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
