import Link from "next/link";
import { findGenerator, GENERATORS } from "@/lib/generators";

// 서버 컴포넌트 — 프롬프트는 import 하지 않는다. (lib/generators.ts 만 사용)
export default function HomePage() {
  const main = findGenerator("email-reply")!;
  const extras = GENERATORS.filter((g) => g.id !== "email-reply");

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-[var(--accent)]">메일</span>리 ✉️
          </h1>
          <p className="mt-3 text-sm text-white/60">
            받은 메일을 붙여넣으면 정중한 답장을 만들어드립니다. <b>본인 서버에서 본인 메일 계정으로</b> 동작하는 셀프호스팅 AI 에이전트.
          </p>
          <p className="mt-1 text-xs text-white/40">
            ※ 입력한 글은 만든 사람의 서버를 거치지 않고, 본인 OpenAI/Gmail 계정으로만 처리됩니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/agent"
            className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-400/15"
          >
            🤖 자동 답장 에이전트
          </Link>
          <Link
            href="/setup"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            🛠️ 설정
          </Link>
        </div>
      </header>

      {/* 메인 카드 — 답장 작성기 */}
      <section className="mb-12">
        <Link
          href={`/generators/${main.id}`}
          className="group block overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 transition hover:border-[var(--accent)] hover:shadow-[0_0_0_2px_rgba(255,216,77,0.15)]"
        >
          <div className="flex items-start gap-5">
            <div className="text-6xl">{main.emoji}</div>
            <div className="flex-1">
              <div className="text-2xl font-bold">{main.name}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {main.description}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-black group-hover:brightness-110">
                ✉️ 답장 만들러 가기 →
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* 그외 기능 — 회의록 / 카피 */}
      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-white/50">
          그외 기능 (보너스)
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {extras.map((g) => (
            <Link
              key={g.id}
              href={`/generators/${g.id}`}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:border-white/30"
            >
              <div className="text-2xl">{g.emoji}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{g.name}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-white/50">
                  {g.description}
                </div>
              </div>
              <span className="text-xs text-white/30">→</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 pt-5 text-xs text-white/40">
        처음이신가요?{" "}
        <Link href="/setup" className="underline hover:text-white">
          /setup 페이지
        </Link>{" "}
        에서 OpenAI / Gmail / 카카오를 연결하세요. 자세한 가이드는{" "}
        <code>README.md</code>와 <code>docs/</code> 폴더에 있습니다.
      </footer>
    </main>
  );
}
