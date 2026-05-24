"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// 비로그인 상태에서 보이는 랜딩 페이지 (스크롤 컨텐츠)
export default function Landing({ msg }: { msg?: string | null }) {
  return (
    <div className="-mx-5">
      {/* === Hero === */}
      <section
        className="px-5 py-20 sm:py-28"
        style={{
          background:
            "radial-gradient(120% 80% at 90% 0%, var(--hot-soft) 0%, transparent 60%), linear-gradient(180deg, var(--warm-soft) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[110px] leading-none sm:text-[140px]"
          >
            ✉️
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bm-hand mt-4 text-[44px] leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-[56px]"
          >
            메일 답장,<br />
            <span className="text-[var(--hot)]">AI 자판기</span>에서 뽑아 쓰세요
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-[16px] leading-relaxed text-[var(--foreground-soft)] sm:text-[18px]"
          >
            가입하고 Gmail만 연결하면 받은편지함을 AI가 알아서 처리해요.
            <br />
            답장은 <b className="text-[var(--foreground)]">임시보관함</b>에 자동으로 만들어두니까,
            한 번 확인하고 보내기만.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link href="/signup" className="bm-btn-hot" style={{ padding: "16px 28px", fontSize: 16 }}>
              ✨ 무료로 시작하기
            </Link>
            <Link href="/login" className="bm-btn-secondary" style={{ padding: "15px 24px", fontSize: 15 }}>
              로그인
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 text-[12px] text-[var(--foreground-muted)]"
          >
            카드 등록 없음 · 자동 발송 없음 · 본인 계정 안에서만 동작
          </motion.p>
          {msg && <p className="mt-4 text-[12px] text-[var(--warning)]">{msg}</p>}
        </div>
      </section>

      {/* === 이렇게 동작해요 === */}
      <Section bg="white" title="이렇게 동작해요" subtitle="가입 → Gmail 연결 → 끝.">
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { emoji: "📥", title: "받은편지함 확인", desc: "5분마다 새 메일이 왔는지 살펴봐요. 읽음 처리 X." },
            { emoji: "🤖", title: "AI가 분류", desc: "답장 필요한 메일 / 광고 / 알림 / 뉴스레터로 자동 구분." },
            { emoji: "✏️", title: "임시보관함에 초안", desc: "답장 필요한 것만 AI가 글 써서 Drafts에 넣어둬요." },
          ].map((s, i) => (
            <StepCard key={i} {...s} index={i + 1} />
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-5 py-4 text-center text-[13px] text-[var(--foreground-soft)]">
          🛡️ <b className="text-[var(--foreground)]">자동 발송은 절대 일어나지 않아요.</b>{" "}
          본인이 임시보관함에서 한 번 확인하고 보내기만 누르면 끝.
        </div>
      </Section>

      {/* === 지원 에이전트 === */}
      <Section bg="warm" title="지원하는 자동화" subtitle="자판기처럼 골라서 활성화하세요.">
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {[
            { emoji: "✉️", name: "메일 자동 답장", tagline: "받은 메일에 AI가 답장 초안을 임시보관함에 자동 작성", available: true },
            { emoji: "📝", name: "회의록 자동 정리", tagline: "Google Meet 녹취를 요약·결정사항·할 일로 자동 정리" },
            { emoji: "📅", name: "일정 자동 조율", tagline: "메일에 회의 일정 요청 오면 가능한 시간 자동 제안" },
            { emoji: "🧹", name: "광고 메일 자동 정리", tagline: "광고/뉴스레터를 라벨로 분류 + 일괄 보관" },
          ].map((a, i) => (
            <AgentPreview key={i} {...a} index={i} />
          ))}
        </div>
      </Section>

      {/* === 안심 포인트 === */}
      <Section bg="white" title="이건 약속해요" subtitle="자동화는 편하면서 안전해야 하니까.">
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {[
            { emoji: "🚫", title: "자동 발송 절대 없음", desc: "drafts.create 까지만. 임시보관함에 들어가고, 발송은 본인이 직접." },
            { emoji: "👀", title: "받은편지함 읽음 처리 X", desc: "gmail.readonly scope만 사용. '읽음' 표시는 사람이 직접 열 때만." },
            { emoji: "🔒", title: "본인 계정 안에서만", desc: "메일 본문은 분석 직후 폐기. 어떤 DB에도 저장 안 함." },
            { emoji: "💸", title: "무료 (Groq 사용 시)", desc: "Groq API는 카드 등록 없이 일 14,400회 무료. 더 쓰려면 본인 키 입력." },
          ].map((s, i) => (
            <PromiseCard key={i} {...s} index={i} />
          ))}
        </div>
      </Section>

      {/* === FAQ === */}
      <Section bg="soft" title="자주 묻는 질문" subtitle="">
        <div className="mt-10 mx-auto max-w-2xl space-y-3">
          {[
            { q: "비용이 정말 무료인가요?", a: "네. Groq API 무료 quota (분당 30회 / 일 14,400회) 안에서 동작합니다. 더 큰 사용량이 필요하면 본인 OpenAI/Gemini 키를 /설정에 입력하면 됩니다." },
            { q: "내 Gmail 내용이 운영자에게 노출되나요?", a: "아니요. 메일은 분류 분석에만 일시 사용되고 즉시 폐기됩니다. 메일 ID + 분류 카테고리만 본인 디렉토리에 기록됩니다." },
            { q: "답장이 자동으로 보내지나요?", a: "절대 아닙니다. 임시보관함(Drafts)까지만 들어가고, 발송은 본인이 Gmail에서 직접 [보내기] 눌러야 합니다." },
            { q: "내가 직접 호스팅할 수도 있나요?", a: "네. GitHub에서 코드 받아 본인 서버에 깔 수 있어요. self-host 모드 가이드: docs/SELF_HOST_VS_SAAS.md" },
          ].map((f, i) => (
            <FaqItem key={i} {...f} />
          ))}
        </div>
      </Section>

      {/* === 마지막 CTA (다크 반전) === */}
      <section className="px-5 py-20" style={{ background: "var(--accent)" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="text-[64px]">🚀</div>
          <h2 className="bm-hand mt-3 text-[36px] leading-tight text-white sm:text-[44px]">
            지금 시작하면<br />
            오늘 받은 메일부터 정리돼요
          </h2>
          <p className="mt-5 text-[15px] text-white/70">
            가입 2분 · Gmail 연결 1분 · 끝.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[var(--hot)] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:brightness-105"
          >
            ✨ 무료로 시작하기
          </Link>
        </motion.div>
      </section>

      {/* === Footer === */}
      <footer className="border-t border-[var(--border-soft)] bg-[var(--background)] px-5 py-8 text-center text-[12px] text-[var(--foreground-muted)]">
        <div className="mx-auto max-w-3xl">
          <p>HI AI LAB · 자동화 에이전트 SaaS</p>
          <p className="mt-2">
            <a
              href="https://github.com/sungpyo9053/hiailab"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              오픈소스
            </a>
            {" · "}
            <a
              href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SELF_HOST_VS_SAAS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              셀프호스팅 가이드
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// === 섹션 컴포넌트 ===

function Section({
  title,
  subtitle,
  children,
  bg,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  bg: "white" | "warm" | "soft";
}) {
  const bgColor =
    bg === "white"
      ? "var(--background-card)"
      : bg === "warm"
        ? "var(--warm-soft)"
        : "var(--background-soft)";

  return (
    <section className="px-5 py-20" style={{ background: bgColor }}>
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="bm-hand text-[32px] text-[var(--foreground)] sm:text-[40px]">{title}</h2>
          {subtitle && (
            <p className="mt-3 text-[14px] text-[var(--foreground-soft)] sm:text-[16px]">{subtitle}</p>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

// 좌/우 번갈아 슬라이드 — 더 임팩트 있는 reveal
function StepCard({
  emoji,
  title,
  desc,
  index,
}: {
  emoji: string;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="bm-card relative p-6 text-center"
    >
      <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--hot)] text-[11px] font-bold text-white">
        {index}
      </div>
      <div className="text-[56px]">{emoji}</div>
      <h3 className="bm-hand mt-3 text-[20px] text-[var(--foreground)]">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--foreground-soft)]">{desc}</p>
    </motion.div>
  );
}

function AgentPreview({
  emoji,
  name,
  tagline,
  available,
  index = 0,
}: {
  emoji: string;
  name: string;
  tagline: string;
  available?: boolean;
  index?: number;
}) {
  const fromLeft = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bm-card flex items-start gap-4 p-5"
    >
      <div className={"text-[40px] " + (available ? "" : "opacity-40")}>{emoji}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="bm-hand text-[18px] text-[var(--foreground)]">{name}</h3>
          {available ? (
            <span className="bm-chip-hot">바로 사용</span>
          ) : (
            <span className="bm-chip">곧 추가</span>
          )}
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--foreground-soft)]">{tagline}</p>
      </div>
    </motion.div>
  );
}

function PromiseCard({
  emoji,
  title,
  desc,
  index = 0,
}: {
  emoji: string;
  title: string;
  desc: string;
  index?: number;
}) {
  const fromLeft = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bm-card flex gap-4 p-5"
    >
      <div className="text-[32px]">{emoji}</div>
      <div>
        <h3 className="bm-hand text-[18px] text-[var(--foreground)]">{title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--foreground-soft)]">{desc}</p>
      </div>
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <motion.details
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="bm-card group p-5"
    >
      <summary className="cursor-pointer text-[15px] font-bold text-[var(--foreground)] marker:hidden list-none flex items-center justify-between">
        <span>{q}</span>
        <span className="text-[var(--foreground-muted)] group-open:rotate-180 transition">▼</span>
      </summary>
      <p className="mt-3 text-[13px] leading-relaxed text-[var(--foreground-soft)]">{a}</p>
    </motion.details>
  );
}
