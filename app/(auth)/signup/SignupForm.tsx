"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.error ?? "가입 실패");
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[var(--foreground)]">
          이메일
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-[12px] border border-[var(--border)] bg-white px-4 py-3 text-[14px] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[var(--foreground)]">
          비밀번호
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8자 이상"
          autoComplete="new-password"
          className="w-full rounded-[12px] border border-[var(--border)] bg-white px-4 py-3 text-[14px] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[var(--foreground)]">
          비밀번호 확인
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="다시 한 번"
          autoComplete="new-password"
          className="w-full rounded-[12px] border border-[var(--border)] bg-white px-4 py-3 text-[14px] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        />
      </div>
      {error && (
        <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-[13px] text-[var(--danger)]">
          ⚠ {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="bm-btn-hot w-full"
        style={{ padding: "13px 20px", fontSize: 15 }}
      >
        {submitting ? "가입 중…" : "무료로 시작하기"}
      </button>
    </form>
  );
}
