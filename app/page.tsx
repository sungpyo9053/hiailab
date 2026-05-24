import Link from "next/link";
import { GENERATORS } from "@/lib/generators";

// 서버 컴포넌트 — 프롬프트는 import 하지 않는다. (lib/generators.ts 만 사용)
export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-[var(--accent)]">오토</span>벤딩 🥤
          </h1>
          <p className="mt-3 text-sm text-white/60">
            필요한 AI 자동화를 자판기처럼 바로 뽑아 쓰는 self-hosted 서비스
          </p>
          <p className="mt-1 text-xs text-white/40">
            ※ 데모용입니다. 실제 결제는 일어나지 않습니다.
          </p>
        </div>
        <Link
          href="/setup"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
        >
          🛠️ 설정
        </Link>
      </header>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-white/90">오늘의 메뉴</h2>
          <span className="text-xs text-white/40">전 품목 ₩900</span>
        </div>

        {/* 자판기 슬롯 느낌의 카드 그리드 */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GENERATORS.map((g) => (
              <Link
                key={g.id}
                href={`/generators/${g.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_0_0_2px_rgba(255,216,77,0.15)]"
              >
                <div className="absolute right-3 top-3 rounded-md bg-[var(--accent)] px-2 py-0.5 text-xs font-bold text-black">
                  ₩900
                </div>
                <div className="text-4xl">{g.emoji}</div>
                <div className="mt-3 text-lg font-semibold">{g.name}</div>
                <div className="mt-1 text-xs leading-relaxed text-white/60">
                  {g.description}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="h-2 w-20 rounded-full bg-white/10" />
                  <span className="text-xs text-white/40 group-hover:text-[var(--accent)]">
                    ₩900으로 뽑기 →
                  </span>
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-white/5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-white/10 pt-5 text-xs text-white/40">
        오토벤딩 로컬 POC · 처음이신가요?{" "}
        <Link href="/setup" className="underline hover:text-white">
          /setup 페이지
        </Link>{" "}
        에서 OpenAI / 이메일 / 카카오를 연결하세요. 자세한 가이드는{" "}
        <code>README.md</code>와 <code>docs/</code> 폴더에 있습니다.
      </footer>
    </main>
  );
}
