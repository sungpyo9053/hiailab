"use client";

import { motion } from "framer-motion";

const STEPS = [
  { cmd: "git clone https://github.com/sungpyo9053/hiailab", desc: "오픈소스 코드 받기" },
  { cmd: "cp .env.example .env.local && nano .env.local", desc: "OWNER_EMAIL, APP_ENCRYPTION_KEY 설정" },
  { cmd: "docker compose up -d", desc: "Docker로 한 번에 실행 (또는 npm run dev)" },
  { cmd: "open http://localhost:3000", desc: "대시보드 접속 + Gmail 연결" },
  { cmd: "→ 자동화 생성", desc: "에이전트 활성화. 5분마다 자동 동작 시작." },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-[var(--background-soft)] py-32">
      <div className="mx-auto max-w-4xl px-5">
        <div className="text-center">
          <span className="bm-chip">How it works</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            <span className="bm-grad-text">5분</span>이면 충분합니다
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-[var(--foreground-soft)] sm:text-[16px]">
            셀프호스팅 기준. SaaS로 쓰면 가입만 하면 됩니다.
          </p>
        </div>

        <div className="mt-14 space-y-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="flex items-center gap-4"
            >
              <div className="mono shrink-0 text-[18px] font-bold text-[var(--foreground-muted)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background-elev)] p-4">
                <div className="mono text-[12px] text-[#a5b4fc] break-all">$ {step.cmd}</div>
                <div className="mt-1.5 text-[12px] text-[var(--foreground-soft)]">{step.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
