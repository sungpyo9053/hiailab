import Link from "next/link";
import SetupClient from "./SetupClient";

// 서버 컴포넌트 — lib/prompts.ts 같은 server-only 모듈은 import 하지 않는다.
// 모든 동적 데이터는 클라이언트가 /api/setup/status 로 직접 가져온다.
export default function SetupPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-white/50 hover:text-white">
          ← HI AI LAB로
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          HI AI LAB 설정 마법사 🛠️
        </h1>
        <p className="mt-2 text-sm text-white/60">
          이 설정은 <b>이 서버에서만</b> 사용됩니다. 입력한 값은 외부 서비스로
          전송되지 않으며, 암호화되어 이 컴퓨터의 <code>.hiailab/config.enc.json</code>{" "}
          파일에만 저장됩니다.
        </p>
        <p className="mt-1 text-xs text-white/40">
          한 번 저장하면 마스킹된 형태(예: <code>sk-****abc</code>)로만
          표시되고, 원문은 다시 화면에 보이지 않습니다.
        </p>
      </header>

      <SetupClient />
    </main>
  );
}
