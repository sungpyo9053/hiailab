"use client";

import { motion } from "framer-motion";

const AGENTS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 7l10 6 10-6" />
      </svg>
    ),
    name: "Gmail Agent",
    sub: "Inbox monitor & classify",
    status: "available",
    scope: ["gmail.readonly", "gmail.compose"],
    result: {
      label: "최근 24시간",
      lines: [
        "47 emails received",
        "12 classified as needs_reply",
        "0 auto-sent",
      ],
    },
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    name: "Calendar Agent",
    sub: "Detect & schedule meetings",
    status: "available",
    scope: ["calendar.events"],
    result: {
      label: "이번 주",
      lines: [
        "3 meetings detected from emails",
        "2 added as tentative",
        "1 conflict flagged",
      ],
    },
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    name: "Draft Reply Agent",
    sub: "Generate reply drafts in your tone",
    status: "available",
    scope: ["gmail.compose", "drafts.create"],
    result: {
      label: "최근 24시간",
      lines: [
        "12 drafts created",
        "Saved to Drafts folder",
        "Manual send required",
      ],
    },
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    name: "Summary Agent",
    sub: "Summarize attachments & threads",
    status: "available",
    scope: ["gmail.readonly"],
    result: {
      label: "지원 형식",
      lines: [
        "PDF, DOCX, XLSX, images",
        "Avg. 24-page doc → 3-line summary",
        "Inserted into email preview",
      ],
    },
  },
];

export default function AgentCatalogSection() {
  return (
    <section id="agents" className="relative py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="bm-chip-hot">Agent Catalog</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            필요한 에이전트만<br />
            <span className="bm-grad-text">골라서 활성화</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-[var(--foreground-soft)] sm:text-[16px]">
            모든 에이전트는 사용자의 실행 환경에서 동작합니다.
            권한 범위와 실행 결과를 카드에서 바로 확인하세요.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {AGENTS.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="bm-card p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[#a5b4fc]">
                    {a.icon}
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-[var(--foreground)]">{a.name}</div>
                    <div className="text-[12px] text-[var(--foreground-muted)]">{a.sub}</div>
                  </div>
                </div>
                <span className="bm-chip-success">● {a.status}</span>
              </div>

              {/* Scope */}
              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
                  권한 범위
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.scope.map((s) => (
                    <span key={s} className="bm-chip mono text-[10px]">{s}</span>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="mt-5 rounded-lg border border-[var(--border-soft)] bg-[var(--background-soft)] p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
                  실행 결과 · {a.result.label}
                </div>
                <ul className="mt-2 space-y-1">
                  {a.result.lines.map((line, j) => (
                    <li key={j} className="flex items-start gap-2 text-[12px] text-[var(--foreground-soft)]">
                      <span className="text-[var(--success)] mono mt-0.5">›</span>
                      <span className="mono">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center text-[12px] text-[var(--foreground-muted)]">
          새 에이전트는 계속 추가됩니다. 필요한 자동화는{" "}
          <a href="https://github.com/sungpyo9053/hiailab/issues" target="_blank" className="text-[var(--foreground-soft)] underline hover:text-[var(--foreground)]">
            GitHub Issues
          </a>
          로 알려주세요.
        </div>
      </div>
    </section>
  );
}
