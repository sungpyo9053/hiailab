import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <div className="mb-8 text-center">
        <Link href="/" className="bm-hero text-3xl text-[var(--foreground)]">
          <span className="text-[var(--hot)]">HI</span>{" "}
          <span>AI</span>{" "}
          <span className="text-[var(--accent)]">LAB</span>
        </Link>
        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
          로그인해서 자동화 에이전트를 켜세요.
        </p>
      </div>

      <div className="bm-card p-8">
        <h1 className="bm-hero mb-6 text-[24px] text-[var(--foreground)]">로그인</h1>
        <LoginForm />
        <p className="mt-6 text-center text-[13px] text-[var(--foreground-soft)]">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-[var(--accent)] hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
