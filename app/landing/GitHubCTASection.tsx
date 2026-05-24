"use client";

import { motion } from "framer-motion";

export default function GitHubCTASection() {
  return (
    <section id="cta" className="relative overflow-hidden py-32">
      <div className="bm-aurora" style={{ background: "#3b82f6", top: "10%", left: "20%", width: 600, height: 600, opacity: 0.25 }} />
      <div className="bm-aurora" style={{ background: "#8b5cf6", bottom: "0%", right: "10%", width: 500, height: 500, opacity: 0.25 }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-3xl px-5 text-center"
      >
        <h2 className="bm-hand text-[40px] leading-tight text-[var(--foreground)] sm:text-[56px]">
          오픈소스로 <span className="bm-grad-text">바로 시작</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--foreground-soft)] sm:text-[16px]">
          5분이면 본인 서버에 설치할 수 있습니다.
          호스팅 버전이 필요하다면 가입 후 무료로 사용해보세요.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/sungpyo9053/hiailab"
            target="_blank"
            className="bm-btn-hot inline-flex items-center gap-2"
            style={{ padding: "16px 32px", fontSize: 15 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub에서 시작하기
          </a>
          <a
            href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SELF_HOST_VS_SAAS.md"
            target="_blank"
            className="bm-btn-secondary"
            style={{ padding: "15px 24px", fontSize: 14 }}
          >
            설치 가이드 보기
          </a>
        </div>

        {/* 빠른 시작 명령 */}
        <div className="mx-auto mt-10 max-w-xl rounded-xl border border-[var(--border)] bg-[var(--background-elev)] p-5 text-left">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
            <span>Quick start</span>
            <span className="mono">~ 5 min</span>
          </div>
          <pre className="mono mt-3 text-[12px] leading-relaxed text-[var(--foreground-soft)] overflow-x-auto">
{`$ git clone https://github.com/sungpyo9053/hiailab
$ cd hiailab && cp .env.example .env.local
$ docker compose up -d
$ open http://localhost:3000`}
          </pre>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-[var(--foreground-muted)]">
          <span>MIT License</span>
          <span>·</span>
          <span>No telemetry</span>
          <span>·</span>
          <span>Self-hostable</span>
        </div>
      </motion.div>
    </section>
  );
}
