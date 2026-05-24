"use client";

import { motion } from "framer-motion";
import DashboardMock from "./DashboardMock";

export default function HeroSection({ msg }: { msg?: string | null }) {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 sm:pt-28">
      <div className="bm-aurora" style={{ background: "#3b82f6", top: -200, left: "10%", width: 600, height: 600 }} />
      <div className="bm-aurora" style={{ background: "#8b5cf6", top: 100, right: "5%", width: 500, height: 500 }} />
      <div className="absolute inset-0 bm-dotgrid opacity-50" />

      <div className="relative mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background-elev)] px-3 py-1.5 text-[12px] font-medium text-[var(--foreground-soft)]">
            <span className="bm-chip-accent rounded-full px-2 py-0.5 text-[10px]">v0.1</span>
            6 categories · 18 agents · MIT License
          </span>

          <h1 className="bm-hand mt-7 text-[42px] leading-[1.05] sm:text-[72px]">
            필요한 <span className="bm-grad-text">AI 에이전트</span>를<br />
            골라 켜세요
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-[var(--foreground-soft)] sm:text-[18px]">
            메일, 일정, 문서, 알림, 리포트 자동화까지.
            반복 업무를 에이전트 단위로 선택하고 실행하는 개인 자동화 허브입니다.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#agents" className="bm-btn-hot" style={{ padding: "14px 30px", fontSize: 15 }}>
              에이전트 둘러보기
            </a>
            <a
              href="https://github.com/sungpyo9053/hiailab"
              target="_blank"
              className="bm-btn-secondary flex items-center gap-2"
              style={{ padding: "13px 22px", fontSize: 14 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub에서 시작하기
            </a>
          </div>

          {msg && <p className="mt-4 text-[12px] text-[var(--warning)]">{msg}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="bm-floating">
            <DashboardMock />
          </div>
          <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
