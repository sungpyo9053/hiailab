import Link from "next/link";
import SetupClient from "./SetupClient";

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-[var(--foreground-soft)] hover:text-[var(--foreground)]">
          ← 처음으로
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="bm-hero text-[32px] text-[var(--foreground)]">설정 🛠️</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--foreground-soft)]">
          자동 답장이 동작하려면 <b>두 가지</b>만 설정하면 됩니다.
          <br />
          ① <b>AI 키</b> — 답장을 만들 때 사용 (Groq 무료 추천)
          <br />
          ② <b>Google 연결</b> — Gmail 받은편지함 읽기 + 임시보관함에 답장 초안 저장
        </p>
        <p className="mt-3 rounded-xl border border-[var(--border-soft)] bg-[var(--background-soft)] px-3 py-2 text-[12px] text-[var(--foreground-soft)]">
          한 번 저장하면 가려진 형태(<code>sk-****abc</code>)로만 표시되고 원본은 안 보입니다.
          이 서버에만 암호화 저장되며 외부 어디에도 전송되지 않습니다.
        </p>
      </header>

      <SetupClient />
    </main>
  );
}
