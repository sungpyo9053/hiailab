"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FEATURES = [
  {
    key: "classify",
    emoji: "🏷️",
    title: "메일 자동 분류",
    desc: "받은 메일을 6가지 카테고리로 자동 구분합니다. needs_reply / newsletter / promotion / notification / spam / other",
    mockType: "classify",
  },
  {
    key: "summarize",
    emoji: "📎",
    title: "첨부파일 요약",
    desc: "PDF, 워드, 이미지 첨부를 자동으로 요약해 메일 상단에 표시합니다.",
    mockType: "summary",
  },
  {
    key: "schedule",
    emoji: "📅",
    title: "일정 자동 감지",
    desc: "메일에 언급된 회의 시간을 감지해 캘린더에 임시 일정으로 등록합니다.",
    mockType: "schedule",
  },
  {
    key: "alert",
    emoji: "🚨",
    title: "장애 알림 정리",
    desc: "GitHub / Datadog / AWS 알림을 심각도별로 묶어서 보여줍니다.",
    mockType: "alert",
  },
  {
    key: "draft",
    emoji: "✍️",
    title: "답장 초안 생성",
    desc: "답장이 필요한 메일에만 본문 톤을 반영한 답장 초안을 임시보관함에 저장합니다.",
    mockType: "draft",
  },
];

export default function ProductDemoSection() {
  const [active, setActive] = useState(FEATURES[0].key);
  const activeFeature = FEATURES.find((f) => f.key === active)!;

  return (
    <section className="relative bg-[var(--background-soft)] py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="bm-chip-hot">Product</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            받은편지함에서 일어나는<br />
            <span className="bm-grad-text">모든 일</span>을 자동화
          </h2>
        </div>

        <div className="mt-16 grid items-start gap-8 lg:grid-cols-[280px_1fr]">
          {/* 좌측 기능 탭 */}
          <div className="space-y-1.5">
            {FEATURES.map((f) => {
              const isActive = f.key === active;
              return (
                <button
                  key={f.key}
                  onClick={() => setActive(f.key)}
                  className={
                    "w-full rounded-xl border p-4 text-left transition " +
                    (isActive
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--background-elev)] hover:border-[var(--border-strong)]")
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[22px]">{f.emoji}</span>
                    <div className="flex-1">
                      <div
                        className={
                          "text-[14px] font-semibold " +
                          (isActive ? "text-[#a5b4fc]" : "text-[var(--foreground)]")
                        }
                      >
                        {f.title}
                      </div>
                    </div>
                    {isActive && <span className="text-[#a5b4fc]">→</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 우측 mock UI */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bm-mock">
                  <div className="bm-mock-header">
                    <div className="bm-mock-dot" style={{ background: "#ff5f57" }} />
                    <div className="bm-mock-dot" style={{ background: "#febc2e" }} />
                    <div className="bm-mock-dot" style={{ background: "#28c840" }} />
                    <div className="ml-3 mono text-[11px] text-[var(--foreground-muted)]">
                      {activeFeature.title}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[18px] font-bold text-[var(--foreground)]">
                      {activeFeature.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[var(--foreground-soft)]">
                      {activeFeature.desc}
                    </p>
                    <div className="mt-5">
                      <FeatureMock type={activeFeature.mockType} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureMock({ type }: { type: string }) {
  if (type === "classify") {
    return (
      <div className="space-y-2">
        {[
          { from: "김민재", subj: "다음 주 회의 일정", cat: "needs_reply", color: "var(--success)" },
          { from: "GitHub", subj: "PR #42 was approved", cat: "notification", color: "var(--warm)" },
          { from: "Newsletter", subj: "주간 디자인 트렌드", cat: "newsletter", color: "var(--foreground-muted)" },
          { from: "[광고]", subj: "Black Friday Sale", cat: "promotion", color: "var(--foreground-muted)" },
          { from: "박지수", subj: "시안 피드백 부탁", cat: "needs_reply", color: "var(--success)" },
        ].map((m, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-[var(--background-soft)] px-3 py-2 text-[11px]">
            <span className="col-span-3 truncate text-[var(--foreground)]">{m.from}</span>
            <span className="col-span-6 truncate text-[var(--foreground-soft)]">{m.subj}</span>
            <span className="col-span-3 text-right">
              <span className="rounded px-1.5 py-0.5 mono text-[10px]" style={{ background: `color-mix(in srgb, ${m.color} 15%, transparent)`, color: m.color }}>
                {m.cat}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (type === "summary") {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background-soft)] p-4">
        <div className="flex items-center gap-2 text-[12px] text-[var(--foreground-soft)]">
          <span>📎</span>
          <span className="mono">2026_Q2_roadmap.pdf · 24 pages</span>
        </div>
        <div className="mt-3 rounded-md bg-[var(--accent-soft)] p-3 text-[12px] leading-relaxed text-[#c7d2fe]">
          <b className="text-[#a5b4fc]">AI 요약:</b> Q2 핵심 목표는 자동화 에이전트 베타 출시.
          5월 1일 alpha, 6월 15일 beta 일정. 책임자 김민재. 의사결정 필요 항목 3개:
          (1) hosted 가격 정책, (2) 무료 quota, (3) 데이터 리텐션 정책.
        </div>
      </div>
    );
  }
  if (type === "schedule") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background-soft)] p-3 text-[12px] text-[var(--foreground-soft)]">
          "다음 주 화요일 오후 3시에 30분 정도 시간 어떠세요?"
        </div>
        <div className="rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-[#a5b4fc]">📅 Detected event</div>
              <div className="mt-1 text-[13px] font-semibold text-[var(--foreground)]">2026-05-26 (화) 15:00 - 15:30</div>
              <div className="text-[11px] text-[var(--foreground-soft)]">참석자: 김민재, 본인</div>
            </div>
            <button className="bm-btn-primary" style={{ padding: "6px 12px", fontSize: 11 }}>Add</button>
          </div>
        </div>
      </div>
    );
  }
  if (type === "alert") {
    return (
      <div className="space-y-2">
        {[
          { sev: "P1", color: "var(--danger)", title: "Datadog: API latency p99 > 2s", count: 12 },
          { sev: "P2", color: "var(--warning)", title: "GitHub: 5 PRs awaiting review", count: 5 },
          { sev: "P3", color: "var(--warm)", title: "AWS: monthly bill $245", count: 1 },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background-soft)] p-3">
            <span className="mono rounded px-2 py-0.5 text-[10px] font-bold" style={{ background: `color-mix(in srgb, ${a.color} 20%, transparent)`, color: a.color }}>
              {a.sev}
            </span>
            <span className="flex-1 text-[12px] text-[var(--foreground)]">{a.title}</span>
            <span className="bm-chip mono text-[10px]">×{a.count}</span>
          </div>
        ))}
      </div>
    );
  }
  // draft
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background-soft)] p-4">
      <div className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)]">
        <span>To: 김민재 매니저 &lt;minjae@example.com&gt;</span>
        <span className="bm-chip-accent text-[10px]">DRAFT · saved</span>
      </div>
      <div className="mt-2 text-[12px] font-semibold text-[var(--foreground)]">Re: 다음 주 회의 일정 협의</div>
      <div className="mt-3 text-[12px] leading-relaxed text-[var(--foreground-soft)]">
        김민재 매니저님 안녕하세요,
        <br /><br />
        말씀해주신 다음 주 화요일 오후 3시, 좋습니다.
        장소는 회의실 A로 예약해두겠습니다.
        <br /><br />
        감사합니다.
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button className="bm-btn-primary" style={{ padding: "8px 14px", fontSize: 12 }}>본인이 검토 후 [보내기]</button>
        <span className="text-[11px] text-[var(--foreground-muted)]">자동 발송 ❌</span>
      </div>
    </div>
  );
}
