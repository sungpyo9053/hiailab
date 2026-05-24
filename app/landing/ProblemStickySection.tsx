"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const PROBLEMS = [
  {
    emoji: "📧",
    title: "끝나지 않는 메일 확인",
    desc: "하루에도 수십 번 받은편지함을 새로고침합니다. 진짜 중요한 메일은 어디 있는지 모릅니다.",
    metric: "47통 / 일",
  },
  {
    emoji: "📎",
    title: "첨부파일과 일정 정리",
    desc: "캘린더, 다운로드 폴더, 메모장에 흩어진 일정과 파일을 매번 손으로 옮깁니다.",
    metric: "20분 / 일",
  },
  {
    emoji: "🔔",
    title: "쓸데없는 알림 더미",
    desc: "GitHub, AWS, Slack, 광고. 진짜 답장이 필요한 것만 골라내려면 또 시간이 듭니다.",
    metric: "80% 노이즈",
  },
  {
    emoji: "✍️",
    title: "반복되는 답장 초안",
    desc: "'네 확인했습니다', '회의 일정 잡아드릴게요'. 형식적인 답장에 매일 1시간씩 씁니다.",
    metric: "60분 / 일",
  },
];

export default function ProblemStickySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} className="relative bg-[var(--background-soft)]" style={{ minHeight: "200vh" }}>
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* 왼쪽 — sticky 카피 */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:flex lg:flex-col lg:justify-center py-24 lg:py-0">
            <span className="bm-chip-warm w-fit">Problem</span>
            <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
              메일 한 통에<br />
              <span className="bm-grad-text">하루가 사라집니다</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--foreground-soft)] sm:text-[17px]">
              직장인 한 명이 하루에 받는 메일은 평균 47통.
              그중 80%는 답장하지 않아도 되는 노이즈,
              나머지 20%에 답장하는 데만 60분이 듭니다.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div>
                <div className="bm-grad-text bm-hand text-[42px]">90분</div>
                <div className="text-[12px] text-[var(--foreground-muted)]">매일 메일에 소비</div>
              </div>
              <div className="h-12 w-px bg-[var(--border)]" />
              <div>
                <div className="bm-grad-text bm-hand text-[42px]">375시간</div>
                <div className="text-[12px] text-[var(--foreground-muted)]">연간 소실 (영업일 기준)</div>
              </div>
            </div>
          </div>

          {/* 오른쪽 — 스크롤에 따라 카드가 순차로 등장 */}
          <div className="space-y-5 py-24">
            {PROBLEMS.map((p, i) => (
              <ProblemCard key={i} problem={p} index={i} progress={scrollYProgress} total={PROBLEMS.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemCard({
  problem,
  index,
  progress,
  total,
}: {
  problem: (typeof PROBLEMS)[number];
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  total: number;
}) {
  // 각 카드가 일정 progress 구간에서 등장
  const segment = 1 / total;
  const start = index * segment * 0.7;
  const mid = start + segment * 0.6;

  const opacity = useTransform(progress, [start, mid], [0.15, 1]);
  const y = useTransform(progress, [start, mid], [40, 0]);
  const scale = useTransform(progress, [start, mid], [0.96, 1]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="bm-card p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[28px]">
          {problem.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[18px] font-bold text-[var(--foreground)]">{problem.title}</h3>
            <span className="bm-chip mono shrink-0">{problem.metric}</span>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--foreground-soft)]">{problem.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
