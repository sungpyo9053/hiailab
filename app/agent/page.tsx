import Link from "next/link";
import AgentClient from "./AgentClient";

export default function AgentPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-white/50 hover:text-white">
          ← 처음으로
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          메일 자동 답장 🤖
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          본인 Gmail을 연결해두면, 새 메일이 올 때마다 AI가 답장 초안을 만들어서{" "}
          <b>Gmail 임시보관함</b>에 넣어 둡니다. 형은 한 번 확인하고 [보내기]만 누르면 끝.
        </p>
        <ul className="mt-3 space-y-1 text-xs text-white/50">
          <li>· 메일은 자동으로 <b>읽음 처리되지 않습니다</b></li>
          <li>· 답장은 <b>자동 발송되지 않습니다.</b> 임시보관함까지만 — 보내기는 본인이 직접</li>
          <li>· 메일 내용은 분석 직후 폐기됩니다 (어디에도 저장 안 함)</li>
        </ul>
      </header>

      <AgentClient />
    </main>
  );
}
