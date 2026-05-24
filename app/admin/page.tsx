import Link from "next/link";
import AdminClient from "./AdminClient";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-white/50 hover:text-white">
          ← 메인으로
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          👑 어드민 대시보드
        </h1>
        <p className="mt-2 text-sm text-white/60">
          가입한 사용자, 활성화된 에이전트, 처리량을 한눈에. (OWNER_EMAIL 만 진입 가능)
        </p>
      </header>

      <AdminClient />
    </main>
  );
}
