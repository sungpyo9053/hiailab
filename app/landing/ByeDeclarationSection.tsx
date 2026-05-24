"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ByeCard = {
  key: string;
  label: string;
  color: string;
  catKey: string;
  catName: string;
  agents: string[];
  message: string;
};

const BYES: ByeCard[] = [
  {
    key: "mail",
    label: "메일 스트레스",
    color: "#3b82f6",
    catKey: "mail",
    catName: "메일 에이전트",
    agents: ["메일 요약", "중요 메일 분류", "답장 초안 생성"],
    message: "받은편지함을 새로고침하는 일은 더 이상 당신의 몫이 아닙니다.",
  },
  {
    key: "schedule",
    label: "일정 놓침",
    color: "#8b5cf6",
    catKey: "calendar",
    catName: "일정 에이전트",
    agents: ["일정 감지", "회의 리마인드", "캘린더 정리"],
    message: "메일 속 약속이 캘린더로 자연스럽게 흘러갑니다.",
  },
  {
    key: "doc",
    label: "문서 읽기 피로",
    color: "#06b6d4",
    catKey: "document",
    catName: "문서 에이전트",
    agents: ["PDF/첨부파일 요약", "핵심 내용 추출", "문서 분류"],
    message: "긴 PDF는 세 줄 요약으로. 핵심만 빠르게.",
  },
  {
    key: "alert",
    label: "알림 과부하",
    color: "#f59e0b",
    catKey: "alert",
    catName: "알림 에이전트",
    agents: ["Slack/Discord 정리", "장애 알림 요약", "중요도 분류"],
    message: "수많은 알림 중에서 진짜 중요한 것만 남깁니다.",
  },
  {
    key: "report",
    label: "보고서 공포",
    color: "#10b981",
    catKey: "report",
    catName: "리포트 에이전트",
    agents: ["일간/주간 요약", "실행 로그 리포트", "자동 보고서 생성"],
    message: "주간 보고는 매주 금요일 오후, 알아서 도착합니다.",
  },
  {
    key: "data",
    label: "엑셀 정리 지옥",
    color: "#ec4899",
    catKey: "data",
    catName: "데이터 정리 에이전트",
    agents: ["CSV/엑셀 정리", "중복 제거", "포맷 변환"],
    message: "흩어진 데이터는 정돈된 표로 돌아옵니다.",
  },
];

export default function ByeDeclarationSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = BYES.find((b) => b.key === selected);

  return (
    <section id="bye" className="relative overflow-hidden bg-[var(--background-soft)] py-32">
      <div className="bm-aurora" style={{ background: "#8b5cf6", top: "20%", right: "-10%", width: 500, height: 500, opacity: 0.2 }} />

      <div className="relative mx-auto max-w-5xl px-5">
        <div className="text-center">
          <span className="bm-chip-accent">Bye Declaration</span>
          <h2 className="bm-hand mt-4 text-[36px] leading-[1.1] text-[var(--foreground)] sm:text-[56px]">
            당신은 AI로<br />
            <span className="bm-grad-text">무엇과 작별</span>하고 싶나요?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-[var(--foreground-soft)] sm:text-[16px]">
            없애고 싶은 반복 업무를 고르면, 그에 맞는 에이전트를 추천해드립니다.
          </p>
        </div>

        {/* Bye 선택 카드 6개 */}
        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {BYES.map((bye, i) => {
            const isActive = bye.key === selected;
            return (
              <motion.button
                key={bye.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setSelected(isActive ? null : bye.key)}
                className={
                  "group relative rounded-2xl border p-6 text-left transition " +
                  (isActive
                    ? "bg-[var(--background-elev)]"
                    : "border-[var(--border)] bg-[var(--background-elev)] hover:border-[var(--border-strong)]")
                }
                style={
                  isActive
                    ? {
                        borderColor: bye.color,
                        boxShadow: `0 0 0 1px ${bye.color}40, 0 12px 40px ${bye.color}25`,
                      }
                    : undefined
                }
              >
                <div className="text-[12px] uppercase tracking-wider mono" style={{ color: bye.color }}>
                  Bye
                </div>
                <div className="mt-1.5 text-[22px] font-bold text-[var(--foreground)] sm:text-[24px]">
                  {bye.label}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--foreground-muted)]">{bye.catName}</span>
                  <span
                    className={"text-[18px] transition " + (isActive ? "translate-x-1" : "group-hover:translate-x-0.5")}
                    style={{ color: bye.color }}
                  >
                    →
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* 선택된 Bye → 추천 에이전트 */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-8 rounded-2xl border bg-[var(--background-elev)] p-7"
              style={{ borderColor: active.color }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider mono" style={{ color: active.color }}>
                    추천 에이전트 · {active.catName}
                  </div>
                  <p className="mt-2 text-[16px] font-bold text-[var(--foreground)] sm:text-[18px]">
                    {active.message}
                  </p>
                </div>
                <a
                  href="#agents"
                  className="rounded-lg px-4 py-2 text-[12px] font-semibold text-white"
                  style={{ background: active.color }}
                >
                  카탈로그에서 보기 →
                </a>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {active.agents.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-soft)] px-3 py-2.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: active.color }} />
                    <span className="text-[13px] text-[var(--foreground)]">{a}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!active && (
          <p className="mt-8 text-center text-[12px] text-[var(--foreground-muted)]">
            카드를 선택하면 추천 에이전트가 표시됩니다.
          </p>
        )}
      </div>
    </section>
  );
}
