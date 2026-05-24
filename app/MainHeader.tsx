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
    <header className="mb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="bm-hero text-[40px] leading-none text-[var(--foreground)]">
            <span className="text-[var(--accent)]">HI AI</span> LAB <span className="text-[28px]">✉️</span>
          </h1>
          <p className="mt-3 text-[15px] text-[var(--foreground-soft)]">
            자동화 에이전트를 자판기처럼 골라 활성화하세요. 본인 계정 안에서만 동작합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {me?.user && (
            <span className="bm-chip">
              📧 {me.user.email}
              {me.user.role === "admin" && (
                <span className="ml-1 rounded-full bg-[var(--warm)] px-1.5 py-px text-[10px] font-bold text-white">
                  ADMIN
                </span>
              )}
            </span>
          )}
          {me?.user?.role === "admin" && (
            <Link
              href="/admin"
              className="bm-btn-secondary"
              style={{ borderColor: "var(--warm)", color: "#92400e", background: "var(--warm-soft)" }}
            >
              👑 어드민
            </Link>
          )}
          {me?.user && (
            <Link href="/setup" className="bm-btn-secondary">
              🛠️ 설정
            </Link>
          )}
          {me?.mode === "saas" && me?.user && (
            <button onClick={logout} className="bm-btn-secondary text-[var(--foreground-muted)]">
              로그아웃
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
