"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const STEPS = [
  {
    key: "connect",
    emoji: "🔌",
    title: "Connect",
    desc: "Gmail 한 번 OAuth 연결. gmail.readonly + gmail.compose scope만 사용합니다.",
    code: "oauth.connect('gmail')",
  },
  {
    key: "rules",
    emoji: "📜",
    title: "Rules",
    desc: "분류 카테고리와 답장 톤을 정합니다. 코드 없이 폼으로.",
    code: "rule: needs_reply → draft",
  },
  {
    key: "automate",
    emoji: "🤖",
    title: "Automate",
    desc: "5분마다 받은편지함을 살펴 분류하고, 답장 초안을 임시보관함에 만듭니다.",
    code: "every 5min · drafts.create()",
  },
  {
    key: "monitor",
    emoji: "📊",
    title: "Monitor",
    desc: "어떤 메일을 어떻게 처리했는지 로그로 확인. 잘못된 분류는 한 클릭 수정.",
    code: "logs.tail() · audit-trail",
  },
];

export default function SolutionPipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  // 라인 그리기 진행도
  const lineH = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} id="product" className="relative overflow-hidden py-32">
      <div className="bm-aurora" style={{ background: "#3b82f6", top: "20%", left: "-10%", width: 500, height: 500, opacity: 0.25 }} />

      <div className="relative mx-auto max-w-5xl px-5">
        <div className="text-center">
          <span className="bm-chip-accent">Solution</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[56px]">
            <span className="bm-grad-text">4단계</span>면 끝납니다
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--foreground-soft)] sm:text-[17px]">
            복잡한 워크플로우 빌더 없이. 연결하고, 규칙 정하고, 켜고, 보면 됩니다.
          </p>
        </div>

        {/* 파이프라인 */}
        <div className="relative mt-20">
          {/* 세로 라인 (배경) */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[var(--border)] sm:block" />
          {/* 세로 라인 (active — 스크롤 따라 채움) */}
          <motion.div
            className="absolute left-1/2 top-0 hidden w-px -translate-x-1/2 sm:block"
            style={{ height: lineH, background: "var(--gradient-hero)" }}
          />

          <div className="space-y-16">
            {STEPS.map((s, i) => (
              <StepRow key={s.key} step={s} index={i} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepRow({
  step,
  index,
  progress,
}: {
  step: (typeof STEPS)[number];
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const total = STEPS.length;
  const seg = 1 / total;
  const start = index * seg;
  const mid = start + seg * 0.5;

  const opacity = useTransform(progress, [start, mid], [0.3, 1]);
  const x = useTransform(progress, [start, mid], [index % 2 === 0 ? -40 : 40, 0]);
  const dotScale = useTransform(progress, [start, mid], [0.6, 1.2]);

  const isLeft = index % 2 === 0;

  return (
    <div className="relative grid items-center gap-6 sm:grid-cols-2 sm:gap-12">
      {/* 카드 — 좌우 번갈아 */}
      <motion.div
        style={{ opacity, x }}
        className={
          isLeft
            ? "bm-card p-6 sm:col-start-1 sm:text-right"
            : "bm-card p-6 sm:col-start-2"
        }
      >
        <div className={"mb-3 flex items-center gap-3 " + (isLeft ? "sm:flex-row-reverse" : "")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[24px]">
            {step.emoji}
          </div>
          <div className={isLeft ? "sm:text-right" : ""}>
            <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
              Step 0{index + 1}
            </div>
            <h3 className="text-[20px] font-bold text-[var(--foreground)]">{step.title}</h3>
          </div>
        </div>
        <p className="text-[14px] leading-relaxed text-[var(--foreground-soft)]">{step.desc}</p>
        <div className="mt-3 rounded-md border border-[var(--border-soft)] bg-[var(--background-soft)] px-3 py-2 mono text-[11px] text-[#a5b4fc]">
          {step.code}
        </div>
      </motion.div>

      {/* 가운데 dot */}
      <motion.div
        style={{ scale: dotScale }}
        className="absolute left-1/2 top-1/2 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full sm:block"
      >
        <div className="absolute inset-0 rounded-full" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 animate-ping rounded-full opacity-50" style={{ background: "var(--accent)" }} />
      </motion.div>
    </div>
  );
}
