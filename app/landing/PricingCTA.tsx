"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PricingCTA() {
  return (
    <section id="pricing" className="relative overflow-hidden py-32">
      <div className="bm-aurora" style={{ background: "#6366f1", top: "10%", left: "20%", width: 600, height: 600, opacity: 0.25 }} />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="bm-chip-accent">Pricing</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            오픈소스는 <span className="bm-grad-text">무료</span>.<br />
            Hosted는 곧.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {/* Open Source */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bm-card p-8"
            style={{ borderColor: "var(--accent)", boxShadow: "0 0 60px rgba(99, 102, 241, 0.2)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-bold text-[var(--foreground)]">Open Source</h3>
              <span className="bm-chip-success">Available now</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="bm-hand text-[56px] text-[var(--foreground)]">$0</span>
              <span className="text-[14px] text-[var(--foreground-muted)]">/ forever</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--foreground-soft)]">
              MIT 라이선스. 본인 서버에 직접 설치. 본인 API 키 사용.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "전체 소스 코드 공개",
                "Docker / Lightsail / 어떤 서버든",
                "본인 OpenAI · Gemini · Groq 키",
                "데이터는 본인 서버에만",
                "커뮤니티 지원 (GitHub Issues)",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-[13px] text-[var(--foreground-soft)]">
                  <span className="text-[var(--success)]">✓</span> {f}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-2">
              <a
                href="https://github.com/sungpyo9053/hiailab"
                target="_blank"
                className="bm-btn-primary text-center"
                style={{ padding: "14px 22px", fontSize: 14 }}
              >
                GitHub에서 시작하기 →
              </a>
              <a
                href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SELF_HOST_VS_SAAS.md"
                target="_blank"
                className="bm-btn-secondary text-center"
                style={{ padding: "12px 22px", fontSize: 13 }}
              >
                설치 가이드 보기
              </a>
            </div>
          </motion.div>

          {/* Hosted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bm-card relative overflow-hidden p-8"
          >
            <div className="absolute -right-12 top-7 rotate-45 bg-[var(--background-soft)] px-12 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Coming Soon
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-bold text-[var(--foreground)]">Hosted</h3>
              <span className="bm-chip">Q2 2026</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="bm-hand text-[56px] text-[var(--foreground-muted)]">$—</span>
              <span className="text-[14px] text-[var(--foreground-muted)]">/ TBD</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--foreground-soft)]">
              설치 없이 가입만 하면 끝. 본인 키를 입력하면 우리 서버에서 안전하게 실행.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "설치 / 운영 불필요",
                "자동 업데이트",
                "팀 단위 사용 (multi-user)",
                "관리자 대시보드",
                "이메일 / Slack 지원",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-[13px] text-[var(--foreground-muted)]">
                  <span>○</span> {f}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <Link href="/signup" className="bm-btn-secondary block text-center" style={{ padding: "14px 22px", fontSize: 14 }}>
                얼리액세스 가입
              </Link>
            </div>
          </motion.div>
        </div>

        {/* 마지막 CTA */}
        <div className="mt-20 rounded-3xl border border-[var(--border)] p-12 text-center" style={{ background: "var(--gradient-hero)" }}>
          <h3 className="bm-hand text-[32px] leading-tight text-white sm:text-[44px]">
            지금 받은편지함을<br />
            정리해보세요
          </h3>
          <p className="mt-4 text-[14px] text-white/85">가입 2분 · Gmail 연결 1분</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[14px] font-bold shadow-2xl transition hover:scale-105"
              style={{ color: "var(--accent-deep)" }}
            >
              무료로 시작하기 →
            </Link>
            <a
              href="https://github.com/sungpyo9053/hiailab"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-[14px] font-bold text-white transition hover:bg-white/20"
            >
              ★ GitHub Star
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
