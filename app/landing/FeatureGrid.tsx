"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    emoji: "📥",
    title: "자동 읽기",
    desc: "5분마다 받은편지함을 polling. 본인이 안 보는 동안에도 동작.",
  },
  {
    emoji: "🧠",
    title: "조건 판단",
    desc: "AI가 메일을 6 카테고리로 분류. 답장 필요한 것만 다음 단계로.",
  },
  {
    emoji: "⚡",
    title: "실행 자동화",
    desc: "Drafts API로 임시보관함에 답장 초안 생성. 발송은 본인이.",
  },
  {
    emoji: "🏠",
    title: "개인 서버 배포",
    desc: "GitHub에서 코드 받아 본인 Lightsail/Docker에 직접 설치 가능.",
  },
  {
    emoji: "📊",
    title: "로그 추적",
    desc: "언제 어떤 메일을 어떻게 처리했는지 audit-trail. 잘못된 분류 한 클릭 수정.",
  },
  {
    emoji: "🔒",
    title: "보안 중심 구조",
    desc: "메일 본문 비저장. 본인 API 키는 AES-256 암호화. 외부 전송 없음.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="bm-chip">Features</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            진짜 필요한 것만<br />
            <span className="bm-grad-text">깊게</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="bm-card p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[22px]">
                {f.emoji}
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-[var(--foreground)]">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--foreground-soft)]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
