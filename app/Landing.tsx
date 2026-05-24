"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// ncloud의 단정함 + 2026 트렌드 (Bento Grid / Glass / Big Bold Type / Animated gradient)
export default function Landing({ msg }: { msg?: string | null }) {
  return (
    <div className="-mx-5">
      {/* === Glass Nav === */}
      <header className="bm-glass sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2 text-[18px] font-extrabold tracking-tight">
            <span className="bm-grad-text">HI AI</span>
            <span className="text-[var(--foreground)]">LAB</span>
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] font-semibold text-[var(--foreground-soft)] sm:flex">
            <a href="#agents" className="hover:text-[var(--foreground)]">에이전트</a>
            <a href="#how" className="hover:text-[var(--foreground)]">동작 원리</a>
            <a href="#safety" className="hover:text-[var(--foreground)]">보안</a>
            <a href="#faq" className="hover:text-[var(--foreground)]">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="bm-btn-secondary" style={{ padding: "8px 14px", fontSize: 13 }}>
              로그인
            </Link>
            <Link href="/signup" className="bm-btn-hot" style={{ padding: "9px 16px", fontSize: 13 }}>
              무료 시작
            </Link>
          </div>
        </div>
      </header>

      {/* === Hero with Bento Grid + Animated Background === */}
      <section className="relative overflow-hidden">
        {/* Animated background blobs */}
        <div
          className="bm-blob"
          style={{ background: "#c4b5fd", top: -100, left: -100, width: 400, height: 400 }}
        />
        <div
          className="bm-blob"
          style={{
            background: "#f9a8d4",
            top: 100,
            right: -150,
            width: 500,
            height: 500,
            animation: "bm-blob-float-slow 22s ease-in-out infinite",
          }}
        />
        <div
          className="bm-blob"
          style={{ background: "#a5b4fc", bottom: -150, left: "30%", width: 450, height: 450 }}
        />

        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          {/* 큰 영웅 카피 — 가운데 정렬 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-block rounded-full border border-[var(--accent)] bg-white/80 backdrop-blur px-4 py-1.5 text-[12px] font-bold text-[var(--accent-deep)] shadow-sm">
              ✨ AI 자동화 에이전트 SaaS
            </span>
            <h1 className="bm-hand mt-6 text-[52px] leading-[1.05] sm:text-[80px]">
              메일 답장은<br />
              <span className="bm-grad-text">AI가 알아서</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-[var(--foreground-soft)] sm:text-[18px]">
              Gmail을 연결하면 받은편지함을 자동 분석해서{" "}
              <b className="text-[var(--foreground)]">답장 초안을 임시보관함에 자동 생성</b>합니다.
              자동 발송은 절대 일어나지 않아요.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="bm-btn-hot" style={{ padding: "14px 28px", fontSize: 15 }}>
                무료로 시작하기 →
              </Link>
              <a href="#how" className="bm-btn-secondary" style={{ padding: "13px 22px", fontSize: 14 }}>
                동작 원리 보기
              </a>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[12px] text-[var(--foreground-muted)]">
              <span>✓ 카드 등록 불필요</span>
              <span>✓ 자동 발송 없음</span>
              <span>✓ 본인 계정 안에서만</span>
            </div>
            {msg && <p className="mt-4 text-[12px] text-[var(--warning)]">{msg}</p>}
          </motion.div>

          {/* === Bento Grid === */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5"
          >
            {/* 큰 임시보관함 카드 (2x2) */}
            <div className="bm-bento col-span-2 row-span-2 p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                    <span className="text-[18px]">📝</span>
                  </div>
                  <div className="text-[12px] font-bold text-[var(--foreground-soft)]">
                    Gmail 임시보관함 (자동 생성)
                  </div>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-deep)]">
                  실시간
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { from: "김민재 매니저", subject: "Re: 다음 주 회의 일정 협의", time: "방금" },
                  { from: "박지수 디자이너", subject: "Re: 시안 피드백 부탁드립니다", time: "12분 전" },
                  { from: "이서연 PM", subject: "Re: 1차 마감 일정 조정", time: "1시간 전" },
                  { from: "정민호 영업", subject: "Re: 견적 문의주신 건 회신드립니다", time: "3시간 전" },
                ].map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--background-soft)] p-3 transition hover:border-[var(--accent)]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[14px]">
                      ✉️
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[var(--foreground)]">
                        {d.subject}
                      </div>
                      <div className="truncate text-[11px] text-[var(--foreground-muted)]">
                        → {d.from}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] text-[var(--foreground-muted)]">{d.time}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-center text-[11px] font-semibold text-[var(--accent-deep)]">
                🛡️ 자동 발송 절대 없음 · 본인이 확인 후 [보내기]
              </div>
            </div>

            {/* 통계 카드 1 (1x1) — 그라데이션 */}
            <div className="bm-bento-hero p-6">
              <div className="text-[12px] font-bold opacity-80">자동 발송</div>
              <div className="mt-2 text-[42px] font-extrabold leading-none">0건</div>
              <div className="mt-2 text-[11px] opacity-80">임시보관함까지만</div>
            </div>

            {/* 통계 카드 2 (1x1) */}
            <div className="bm-bento p-6">
              <div className="text-[12px] font-bold text-[var(--foreground-soft)]">하루 처리 가능</div>
              <div className="bm-grad-text mt-2 text-[42px] font-extrabold leading-none">14.4k</div>
              <div className="mt-2 text-[11px] text-[var(--foreground-muted)]">Groq 무료 quota</div>
            </div>

            {/* 에이전트 카드 (2x1) */}
            <div className="bm-bento col-span-2 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-[var(--foreground-soft)]">에이전트 카탈로그</div>
                  <div className="mt-1 text-[18px] font-extrabold text-[var(--foreground)]">자판기처럼 골라 활성화</div>
                </div>
                <Link
                  href="#agents"
                  className="text-[12px] font-bold text-[var(--accent-deep)] hover:underline"
                >
                  전체 보기 →
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["✉️ 메일 답장", "📝 회의록 정리", "📅 일정 조율", "🧹 광고 정리"].map((t, i) => (
                  <span
                    key={i}
                    className={
                      "rounded-full px-3 py-1.5 text-[12px] font-semibold " +
                      (i === 0
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--background-soft)] text-[var(--foreground-soft)]")
                    }
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 보안 카드 (2x1) — soft */}
            <div className="bm-bento-soft col-span-2 p-6">
              <div className="flex items-start gap-3">
                <div className="text-[24px]">🔒</div>
                <div>
                  <div className="text-[15px] font-extrabold text-[var(--foreground)]">
                    본인 계정 안에서만 동작
                  </div>
                  <div className="mt-1 text-[12px] leading-relaxed text-[var(--foreground-soft)]">
                    메일 본문은 분류·답장 생성 직후 즉시 폐기. DB나 디스크에 저장 안 함.
                    <br />
                    Gmail OAuth (gmail.readonly + gmail.compose) 만 사용 · 읽음 처리 X.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === 동작 원리 === */}
      <section id="how" className="border-t border-[var(--border)] bg-[var(--background-soft)] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeader
            tag="동작 원리"
            title="가입 → Gmail 연결 → 끝."
            subtitle="복잡한 설정 없이 5분 안에 자동화가 시작됩니다."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {[
              { emoji: "📥", title: "받은편지함 자동 확인", desc: "5분마다 새 메일을 살펴봅니다. 읽음 처리는 하지 않아요." },
              { emoji: "🤖", title: "AI 자동 분류", desc: "답장 필요 / 광고 / 뉴스레터 / 알림 등 6가지로 자동 구분." },
              { emoji: "✏️", title: "답장 초안 자동 생성", desc: "답장 필요한 메일에만 AI가 글을 작성해 임시보관함에 저장." },
            ].map((s, i) => (
              <StepCard key={i} {...s} index={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* === 에이전트 그리드 === */}
      <section id="agents" className="border-t border-[var(--border)] bg-white py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeader
            tag="에이전트"
            title="자판기처럼 골라 활성화"
            subtitle="필요한 자동화만 선택해서 켜세요. 계속 추가되고 있습니다."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { emoji: "✉️", name: "메일 자동 답장", tagline: "받은 메일에 답장 초안을 임시보관함에 자동 작성", available: true },
              { emoji: "📝", name: "회의록 자동 정리", tagline: "Google Meet 녹취를 요약·결정사항·할 일로" },
              { emoji: "📅", name: "일정 자동 조율", tagline: "회의 일정 요청에 가능 시간 자동 제안" },
              { emoji: "🧹", name: "광고 메일 정리", tagline: "광고/뉴스레터 자동 분류 + 일괄 보관" },
            ].map((a, i) => (
              <AgentPreview key={i} {...a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* === 보안 === */}
      <section id="safety" className="border-t border-[var(--border)] bg-[var(--background-soft)] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeader
            tag="보안"
            title="민감한 메일이라 더 신중하게"
            subtitle="자동화는 편하면서 안전해야 합니다."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {[
              { emoji: "🚫", title: "자동 발송 절대 없음", desc: "Gmail Drafts API까지만 사용. 임시보관함에 들어가고, 발송은 본인이 직접 확인 후." },
              { emoji: "👀", title: "받은편지함 읽음 처리 X", desc: "gmail.readonly scope만 사용. 사람이 직접 열기 전에는 '읽음' 표시 안 됨." },
              { emoji: "🔒", title: "본인 계정 안에서만", desc: "메일 본문은 분류·답장 생성 직후 즉시 폐기. DB나 디스크에 저장 안 함." },
              { emoji: "💸", title: "무료 (Groq Llama 3.3 70B)", desc: "카드 등록 없이 분당 30회 / 일 14,400회 무료. 더 필요하면 본인 키 입력." },
            ].map((s, i) => (
              <PromiseCard key={i} {...s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section id="faq" className="border-t border-[var(--border)] bg-white py-24">
        <div className="mx-auto max-w-3xl px-5">
          <SectionHeader tag="FAQ" title="자주 묻는 질문" />
          <div className="mt-10 space-y-3">
            {[
              { q: "비용이 정말 무료인가요?", a: "네. Groq API 무료 quota (분당 30회 / 일 14,400회) 안에서 동작합니다. 더 큰 사용량이 필요하면 본인 OpenAI/Gemini 키를 /설정에 입력하면 됩니다." },
              { q: "내 Gmail 내용이 운영자에게 노출되나요?", a: "아니요. 메일 본문은 분석에만 일시 사용되고 즉시 폐기됩니다. 메일 ID + 분류 카테고리만 본인 디렉토리에 기록됩니다." },
              { q: "답장이 자동으로 보내지나요?", a: "절대 아닙니다. 임시보관함(Drafts)까지만 들어가고, 발송은 본인이 Gmail에서 직접 [보내기] 눌러야 합니다." },
              { q: "내가 직접 호스팅할 수도 있나요?", a: "네. GitHub에서 코드 받아 본인 서버에 깔 수 있어요. self-host 모드 가이드: docs/SELF_HOST_VS_SAAS.md" },
            ].map((f, i) => (
              <FaqItem key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* === 마지막 CTA === */}
      <section className="relative overflow-hidden py-20" style={{ background: "var(--gradient-hero)" }}>
        <div
          className="bm-blob"
          style={{ background: "#fbcfe8", top: -100, right: -100, width: 400, height: 400, opacity: 0.4 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-3xl px-5 text-center"
        >
          <h2 className="bm-hand text-[40px] leading-tight text-white sm:text-[52px]">
            지금 가입하면<br />
            오늘 받은 메일부터 정리됩니다
          </h2>
          <p className="mt-5 text-[15px] text-white/85">가입 2분 · Gmail 연결 1분 · 끝.</p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold shadow-2xl transition hover:scale-105"
            style={{ color: "var(--accent-deep)" }}
          >
            무료로 시작하기 →
          </Link>
        </motion.div>
      </section>

      {/* === 푸터 === */}
      <footer className="border-t border-[var(--border)] bg-[var(--background-soft)] py-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <div className="text-[16px] font-extrabold">
                <span className="bm-grad-text">HI AI</span> LAB
              </div>
              <p className="mt-2 text-[12px] text-[var(--foreground-muted)]">
                자동화 에이전트 SaaS.<br />
                본인 계정 안에서 동작하는 안전한 메일 자동화.
              </p>
            </div>
            <FooterCol
              title="제품"
              items={[
                { label: "에이전트 카탈로그", href: "/" },
                { label: "동작 원리", href: "#how" },
                { label: "보안", href: "#safety" },
                { label: "FAQ", href: "#faq" },
              ]}
            />
            <FooterCol
              title="개발자"
              items={[
                { label: "GitHub", href: "https://github.com/sungpyo9053/hiailab" },
                { label: "셀프호스팅 가이드", href: "https://github.com/sungpyo9053/hiailab/blob/main/docs/SELF_HOST_VS_SAAS.md" },
                { label: "API 키 가이드", href: "https://github.com/sungpyo9053/hiailab/blob/main/docs/KEYS.md" },
                { label: "커스터마이즈", href: "https://github.com/sungpyo9053/hiailab/blob/main/docs/CUSTOMIZE.md" },
              ]}
            />
            <FooterCol
              title="시작"
              items={[
                { label: "무료 가입", href: "/signup" },
                { label: "로그인", href: "/login" },
              ]}
            />
          </div>
          <div className="mt-10 border-t border-[var(--border)] pt-6 text-[11px] text-[var(--foreground-muted)]">
            © 2026 HI AI LAB · 오픈소스 · 모든 메일은 본인 계정 안에서만 처리됩니다.
          </div>
        </div>
      </footer>
    </div>
  );
}

// === 컴포넌트 ===

function SectionHeader({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <span className="inline-block rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--accent-deep)]">
        {tag}
      </span>
      <h2 className="bm-hand mt-4 text-[32px] text-[var(--foreground)] sm:text-[40px]">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-[14px] text-[var(--foreground-soft)] sm:text-[15px]">{subtitle}</p>
      )}
    </motion.div>
  );
}

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="bm-bento relative p-7"
    >
      <span className="absolute right-5 top-5 text-[12px] font-bold text-[var(--foreground-muted)]">
        0{index}
      </span>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[24px]">
        {emoji}
      </div>
      <h3 className="mt-4 text-[17px] font-bold text-[var(--foreground)]">{title}</h3>
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bm-bento p-5"
    >
      <div className="flex items-start justify-between">
        <div
          className={
            "flex h-12 w-12 items-center justify-center rounded-xl text-[22px] " +
            (available ? "bg-[var(--accent-soft)]" : "bg-[var(--background-soft)] opacity-50")
          }
        >
          {emoji}
        </div>
        {available ? (
          <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-deep)]">
            바로 사용
          </span>
        ) : (
          <span className="rounded-full bg-[var(--background-deep)] px-2 py-0.5 text-[10px] font-bold text-[var(--foreground-muted)]">
            준비 중
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[15px] font-bold text-[var(--foreground)]">{name}</h3>
      <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--foreground-soft)]">{tagline}</p>
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bm-bento flex gap-4 p-6"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[24px]">
        {emoji}
      </div>
      <div>
        <h3 className="text-[15px] font-bold text-[var(--foreground)]">{title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--foreground-soft)]">{desc}</p>
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
      className="bm-bento group p-5"
    >
      <summary className="cursor-pointer text-[15px] font-bold text-[var(--foreground)] marker:hidden list-none flex items-center justify-between">
        <span>{q}</span>
        <span className="text-[var(--foreground-muted)] transition group-open:rotate-180">▼</span>
      </summary>
      <p className="mt-3 text-[13px] leading-relaxed text-[var(--foreground-soft)]">{a}</p>
    </motion.details>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-[12px] font-extrabold uppercase tracking-wider text-[var(--foreground)]">
        {title}
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <Link href={it.href} className="text-[13px] text-[var(--foreground-soft)] hover:text-[var(--accent-deep)] hover:underline">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
