"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "에이전트 선택",
    desc: "Catalog에서 필요한 에이전트를 카테고리별로 골라 활성화합니다.",
    snippet: "메일 요약 · PDF 요약 · Slack 정리",
  },
  {
    n: "02",
    title: "필요한 API 키 연결",
    desc: "Gmail, Calendar, Slack 등 필요한 서비스만 OAuth로 연결합니다. 최소 권한 원칙.",
    snippet: "oauth.connect('gmail')",
  },
  {
    n: "03",
    title: "실행 조건 설정",
    desc: "주기, 트리거, 조건을 폼으로 정합니다. 코드 작성은 필요 없습니다.",
    snippet: "every 5min · when needs_reply",
  },
  {
    n: "04",
    title: "자동 실행",
    desc: "설정된 조건에 따라 백그라운드에서 자동으로 동작합니다.",
    snippet: "agent.run() → drafts.create()",
  },
  {
    n: "05",
    title: "결과 확인",
    desc: "실행 결과를 대시보드에서 확인하고, 적용 여부는 사용자가 직접 결정합니다.",
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
            <span className="bm-grad-text">5단계</span>로 자동화 시작
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
              {i < STEPS.length - 1 && (
                <div className="hidden text-[20px] text-[var(--foreground-muted)] sm:block">↓</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
