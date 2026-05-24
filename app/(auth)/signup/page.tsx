import Link from "next/link";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <div className="mb-8 text-center">
        <Link href="/" className="bm-hero text-3xl text-[var(--foreground)]">
          <span className="text-[var(--hot)]">HI</span>{" "}
          <span>AI</span>{" "}
          <span className="text-[var(--accent)]">LAB</span>
        </Link>
        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
          무료로 가입하고 자동화 에이전트를 켜세요.
        </p>
      </div>

      <div className="bm-card p-8">
        <h1 className="bm-hero mb-6 text-[24px] text-[var(--foreground)]">회원가입</h1>
        <SignupForm />
        <p className="mt-6 text-center text-[13px] text-[var(--foreground-soft)]">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
            로그인
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-[11px] text-[var(--foreground-muted)]">
        가입 후 메인에서 본인 Gmail을 연동하면 자동 답장이 시작됩니다.
        <br />
        모든 데이터는 본인 계정 안에서만 처리되고, 자동 발송은 절대 일어나지 않습니다.
      </p>
    </main>
  );
}
