"use client";

import { motion } from "framer-motion";

type SubAgent = { name: string; status: "available" | "beta" | "coming_soon" };
type Category = {
  key: string;
  name: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
  agents: SubAgent[];
};

const CATEGORIES: Category[] = [
  {
    key: "mail",
    name: "메일 에이전트",
    desc: "받은편지함을 분석하고 답장을 준비합니다.",
    color: "#3b82f6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 7l10 6 10-6" />
      </svg>
    ),
    agents: [
      { name: "메일 요약", status: "available" },
      { name: "중요 메일 분류", status: "available" },
      { name: "답장 초안 생성", status: "available" },
    ],
  },
  {
    key: "calendar",
    name: "일정 에이전트",
    desc: "회의와 일정을 자동으로 관리합니다.",
    color: "#8b5cf6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    agents: [
      { name: "일정 감지", status: "available" },
      { name: "회의 리마인드", status: "beta" },
      { name: "캘린더 정리", status: "beta" },
    ],
  },
  {
    key: "document",
    name: "문서 에이전트",
    desc: "긴 문서를 요약하고 핵심을 추출합니다.",
    color: "#06b6d4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    agents: [
      { name: "PDF/첨부파일 요약", status: "available" },
      { name: "문서 분류", status: "available" },
      { name: "핵심 내용 추출", status: "beta" },
    ],
  },
  {
    key: "alert",
    name: "알림 에이전트",
    desc: "알림을 정리하고 중요한 것만 골라냅니다.",
    color: "#f59e0b",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    agents: [
      { name: "Slack/Discord 알림 정리", status: "available" },
      { name: "장애 알림 요약", status: "beta" },
      { name: "중요도 분류", status: "available" },
    ],
  },
  {
    key: "report",
    name: "리포트 에이전트",
    desc: "주기적으로 요약 보고서를 자동 생성합니다.",
    color: "#10b981",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
    agents: [
      { name: "일간/주간 요약", status: "available" },
      { name: "실행 로그 리포트", status: "available" },
      { name: "자동 보고서 생성", status: "beta" },
    ],
  },
  {
    key: "data",
    name: "데이터 정리 에이전트",
    desc: "흩어진 데이터를 정제하고 포맷을 맞춥니다.",
    color: "#ec4899",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </svg>
    ),
    agents: [
      { name: "CSV/엑셀 정리", status: "beta" },
      { name: "중복 제거", status: "available" },
      { name: "포맷 변환", status: "coming_soon" },
    ],
  },
];

export default function AgentCatalogSection() {
  return (
    <section id="agents" className="relative py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="bm-chip-accent">Agent Catalog</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            <span className="bm-grad-text">6 카테고리</span> · 18 에이전트
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-[var(--foreground-soft)] sm:text-[16px]">
            카테고리별로 검증된 에이전트를 필요한 만큼 활성화하세요.
            모든 에이전트는 사용자의 실행 환경에서 동작합니다.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="bm-card flex flex-col p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in srgb, ${cat.color} 15%, transparent)`,
                      color: cat.color,
                    }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-[var(--foreground)]">{cat.name}</div>
                    <div className="text-[10px] uppercase tracking-wider mono" style={{ color: cat.color }}>
                      {cat.key}
                    </div>
                  </div>
                </div>
                <span className="bm-chip mono text-[10px]">{cat.agents.length} agents</span>
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-[var(--foreground-soft)]">{cat.desc}</p>

              <div className="mt-5 space-y-1.5">
                {cat.agents.map((agent, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-soft)] bg-[var(--background-soft)] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background:
                            agent.status === "available"
                              ? "var(--success)"
                              : agent.status === "beta"
                                ? "var(--warning)"
                                : "var(--foreground-muted)",
                        }}
                      />
                      <span className="text-[12px] text-[var(--foreground)]">{agent.name}</span>
                    </div>
                    <span className="mono text-[9px] uppercase tracking-wider text-[var(--foreground-muted)]">
                      {agent.status === "available"
                        ? "ready"
                        : agent.status === "beta"
                          ? "beta"
                          : "soon"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center text-[12px] text-[var(--foreground-muted)]">
          새 카테고리·에이전트는 계속 추가됩니다. 요청은{" "}
          <a
            href="https://github.com/sungpyo9053/hiailab/issues"
            target="_blank"
            className="text-[var(--foreground-soft)] underline hover:text-[var(--foreground)]"
          >
            GitHub Issues
          </a>
          로 알려주세요.
        </div>
      </div>
    </section>
  );
}
