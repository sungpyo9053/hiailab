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
            <span className="bm-chip-accent rounded-full px-2 py-0.5 text-[10px]">HIAI</span>
            AI로 내 삶에서 무엇을 바꿀까
          </span>

          {/* Hi AI. Bye ____.  핵심 비주얼 */}
          <div className="mt-8 sm:mt-10">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bm-hand text-[56px] leading-[1.02] text-[var(--foreground)] sm:text-[96px]"
            >
              Hi AI.
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bm-hand mt-2 text-[56px] leading-[1.02] sm:text-[96px]"
            >
              Bye <span className="bm-grad-text">반복업무</span>.
            </motion.h1>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-relaxed text-[var(--foreground-soft)] sm:text-[18px]">
            필요한 AI 에이전트를 골라 켜고,
            <br className="hidden sm:inline" />
            매일 반복되는 일을 하나씩 떠나보내세요.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-relaxed text-[var(--foreground-muted)] sm:text-[14px]">
            메일 정리 · 일정 확인 · 문서 요약 · 알림 분류 · 리포트 생성까지.
            내 삶에서 없애고 싶은 일을 에이전트로 자동화합니다.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="#bye" className="bm-btn-hot" style={{ padding: "14px 30px", fontSize: 15 }}>
              나의 Bye 선택하기
            </a>
            <a href="#agents" className="bm-btn-secondary" style={{ padding: "13px 22px", fontSize: 14 }}>
              에이전트 둘러보기
            </a>
          </div>

          {msg && <p className="mt-4 text-[12px] text-[var(--warning)]">{msg}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
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
