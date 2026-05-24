"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Me = {
  mode: "self" | "saas";
  user: {
    id: string;
    email: string | null;
    role: "admin" | "user";
    mode: "self" | "saas";
  } | null;
};

export default function MainHeader() {
  const [me, setMe] = useState<Me | null>(null);

  async function refresh() {
    try {
      const r = await fetch("/api/auth/me");
      setMe(await r.json());
    } catch {
      // ignore
    }
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-[var(--accent)]">HI AI</span> LAB ✉️
        </h1>
        <p className="mt-3 text-sm text-white/60">
          자동화 에이전트를 자판기처럼 골라 활성화하세요. 본인 계정 안에서만 동작합니다.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {me?.user && (
          <span className="text-xs text-white/50">
            📧 {me.user.email}
            {me.user.role === "admin" && (
              <span className="ml-1 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-1.5 py-0.5 text-[10px] text-yellow-300">
                ADMIN
              </span>
            )}
          </span>
        )}
        {me?.user?.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-200 hover:bg-yellow-400/15"
          >
            👑 어드민
          </Link>
        )}
        {me?.user && (
          <Link
            href="/setup"
            className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/5"
          >
            🛠️ 키/연결 관리
          </Link>
        )}
        {me?.mode === "saas" && me?.user && (
          <button
            onClick={logout}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/50 hover:bg-white/5"
          >
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
}
