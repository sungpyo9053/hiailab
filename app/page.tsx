import Link from "next/link";
import AgentClient from "./agent/AgentClient";

// 메인 = 자동 답장 에이전트.
// 사용자 요청대로 다른 자판기(수동 답장/회의록/카피)는 footer 링크로만 노출.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-[var(--accent)]">HI AI</span> LAB · 메일 자동 답장 에이전트 ✉️
          </h1>
          <p className="mt-2 text-sm text-white/60">
            본인 Gmail을 연결해두면 받은편지함에 새 메일이 올 때마다 답장 초안을 임시보관함에 자동 생성합니다.
          </p>
          <p className="mt-1 text-xs text-white/40">
            ※ 메일은 만든 사람 서버를 거치지 않고, 본인 OpenAI · Gmail 계정 안에서만 처리됩니다. 답장은 자동 발송되지 않습니다 (임시보관함까지만).
          </p>
        </div>
        <Link
          href="/setup"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
        >
          🛠️ 설정
        </Link>
      </header>

      <AgentClient />

      <footer className="mt-10 border-t border-white/10 pt-5 text-xs text-white/40">
        부가 기능:{" "}
        <Link href="/generators/email-reply" className="underline hover:text-white">
          수동 답장 자판기
        </Link>{" "}
        ·{" "}
        <Link href="/generators/meeting-summary" className="underline hover:text-white">
          회의록 자판기
        </Link>{" "}
        ·{" "}
        <Link href="/generators/product-copy" className="underline hover:text-white">
          카피 자판기
        </Link>
      </footer>
    </main>
  );
}
