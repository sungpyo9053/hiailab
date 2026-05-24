"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "작별하고 싶은 일을 고른다",
    desc: "메일 스트레스, 일정 놓침, 문서 피로 — 매일 반복되는 것 중 하나부터 시작하세요.",
    snippet: "Bye declaration",
  },
  {
    n: "02",
    title: "필요한 에이전트를 선택한다",
    desc: "선택한 'Bye'에 맞는 에이전트를 Catalog에서 활성화합니다.",
    snippet: "agent.activate('mail-summary')",
  },
  {
    n: "03",
    title: "API 키와 실행 조건을 연결한다",
    desc: "필요한 서비스만 OAuth로 연결하고, 주기·트리거를 폼으로 정합니다. 코드 작성 없음.",
    snippet: "oauth + schedule + trigger",
  },
  {
    n: "04",
    title: "에이전트가 반복 업무를 처리한다",
    desc: "설정된 조건에 따라 백그라운드에서 자동으로 동작합니다.",
    snippet: "agent.run() · idempotent",
  },
  {
    n: "05",
    title: "실행 결과를 확인하고 적용한다",
    desc: "결과는 대시보드에 쌓이고, 외부에 적용할지는 사용자가 직접 결정합니다.",
    snippet: "review → apply / discard",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative bg-[var(--background-soft)] py-32">
      <div className="mx-auto max-w-4xl px-5">
        <div className="text-center">
          <span className="bm-chip">How it works</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            <span className="bm-grad-text">5단계</span>로<br className="sm:hidden" />
            반복을 떠나보내세요
          </h2>
        </div>

        <div className="mt-14 space-y-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="bm-card flex items-start gap-5 p-6"
            >
              <div className="mono shrink-0 text-[22px] font-bold text-[var(--foreground-muted)]">
                {step.n}
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-[var(--foreground)]">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--foreground-soft)]">{step.desc}</p>
                <div className="mt-3 inline-block rounded-md border border-[var(--border-soft)] bg-[var(--background-soft)] px-2.5 py-1 mono text-[11px] text-[#a5b4fc]">
                  {step.snippet}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
