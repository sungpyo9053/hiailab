import Link from "next/link";
import AgentClient from "./AgentClient";

export default function AgentPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-white/50 hover:text-white">
          ← HI AI LAB로
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          메일 자동 답장 에이전트 🤖
        </h1>
        <p className="mt-2 text-sm text-white/60">
          본인 Gmail 계정을 연결하면, 받은편지함을 주기적으로 확인해서
          <b> 답장이 필요한 메일만 골라 임시보관함에 답장 초안을 만들어 둡니다.</b>
        </p>
        <ul className="mt-3 space-y-1 text-xs text-white/40">
          <li>· 받은편지함은 <b>읽음 처리하지 않습니다</b></li>
          <li>· 답장은 <b>자동 발송되지 않습니다.</b> 임시보관함(Drafts)까지만 — 발송은 본인이 직접</li>
          <li>· 메일 본문은 분석 직후 폐기합니다 (어떤 DB에도 저장하지 않음)</li>
        </ul>
      </header>

      <AgentClient />

      <p className="mt-6 text-xs text-white/40">
        Google OAuth 앱이 아직 없다면 →{" "}
        <Link href="/docs/setup-gmail-automation" className="underline">
          Google Cloud 등록 가이드
        </Link>
      </p>
    </main>
  );
}
