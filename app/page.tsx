import Link from "next/link";
import CatalogClient from "./CatalogClient";

// 메인 = 에이전트 카탈로그 + 활성화 대시보드
export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-[var(--accent)]">HI AI</span> LAB ✉️
          </h1>
          <p className="mt-3 text-sm text-white/60">
            자동화 에이전트를 자판기처럼 골라 활성화하세요. 본인 계정 안에서만 동작합니다.
          </p>
        </div>
        <Link
          href="/setup"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
        >
          🛠️ 키/연결 관리
        </Link>
      </header>

      <CatalogClient />

      <footer className="mt-10 border-t border-white/10 pt-5 text-xs text-white/40">
        ※ 입력한 키와 메일 내용은 만든 사람 서버를 거치지 않고 본인 계정 안에서만 처리됩니다.
        답장은 자동 발송되지 않고 임시보관함까지만 들어갑니다.
      </footer>
    </main>
  );
}
