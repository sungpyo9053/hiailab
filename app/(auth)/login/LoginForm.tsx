"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.error ?? "로그인 실패");
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
          className="w-full rounded-[12px] border border-[var(--border)] bg-white px-4 py-3 text-[14px] text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-[var(--foreground)]">
          비밀번호
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8자 이상"
          autoComplete="current-password"
          className="w-full rounded-[12px] border border-[var(--border)] bg-white px-4 py-3 text-[14px] text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
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
        className="bm-btn-primary w-full"
        style={{ padding: "13px 20px", fontSize: 15 }}
      >
        {submitting ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
