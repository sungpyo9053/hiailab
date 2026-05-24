"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORY_LABEL, type AgentMeta } from "@/lib/agents";

type ActivationEntry = { enabled: boolean; activatedAt: string };
type AgentItem = AgentMeta & {
  activation: ActivationEntry | null;
  prereqMet: boolean;
  missingPrereqs: string[];
};
type AccountInfo = { gmailEmail: string | null; aiProvider: "groq" | "gemini" | "openai" | "none" };
type Me = {
  mode: "self" | "saas";
  user: { id: string; email: string | null; role: "admin" | "user"; mode: "self" | "saas" } | null;
};

const PROVIDER_LABEL: Record<string, string> = {
  groq: "Groq (무료)",
  gemini: "Gemini",
  openai: "OpenAI",
  none: "미연결",
};

export default function CatalogClient() {
  const [me, setMe] = useState<Me | null>(null);
  const [data, setData] = useState<{ agents: AgentItem[]; accountInfo: AccountInfo } | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    try {
      const meResp = await fetch("/api/auth/me").then((r) => r.json());
      setMe(meResp);
      if (!meResp.user) {
        setData(null);
        return;
      }
      const r = await fetch("/api/agents");
      if (r.ok) setData(await r.json());
    } catch {
      // ignore
    }
  }
  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("connected") || q.get("gmail_connected")) {
      setMsg("✓ Gmail 연결 완료");
      window.history.replaceState({}, "", "/");
      void refresh();
    } else if (q.get("error")) {
      const code = q.get("error") || "";
      const map: Record<string, string> = {
        not_owner: "이 인스턴스의 소유자(OWNER_EMAIL) 메일만 연결할 수 있어요.",
        state_mismatch: "보안 토큰 불일치 — 다시 시도해 주세요.",
        missing_code: "OAuth 코드 누락 — 다시 시도해 주세요.",
        token_exchange_failed: "Google과 인증 교환 실패",
        no_email: "이메일을 받지 못했습니다.",
      };
      setMsg(`⚠ ${map[code] ?? code}`);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  async function toggle(agentId: string, enabled: boolean) {
    setToggling(agentId);
    setMsg(null);
    try {
      const r = await fetch(`/api/agents/${agentId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const d = await r.json();
      if (!d.ok) setMsg(`⚠ ${d.error}`);
      else setMsg(enabled ? "✓ 에이전트를 활성화했어요" : "에이전트를 비활성화했어요");
      await refresh();
    } catch (e) {
      setMsg(`⚠ ${(e as Error).message}`);
    } finally {
      setToggling(null);
    }
  }

  if (!me) {
    return <div className="bm-card p-8 text-center text-sm text-[var(--foreground-muted)]">로딩 중…</div>;
  }

  // saas + 미로그인 → 회원가입/로그인 히어로
  if (me.mode === "saas" && !me.user) {
    return (
      <section className="bm-card-hero p-12 text-center">
        <div className="text-6xl mb-4">✉️</div>
        <h2 className="bm-hero text-[34px] text-[var(--foreground)]">
          메일 자동화, <span className="text-[var(--hot)]">자판기처럼</span> 골라 쓰세요
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--foreground-soft)]">
          가입 후 본인 Gmail을 연동하면 자동 답장 초안이 임시보관함에 자동으로 만들어져요.
          <br />
          <b className="text-[var(--foreground)]">자동 발송은 절대 일어나지 않아요.</b> 본인이 검토 후 보내기만.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="bm-btn-hot">
            ✨ 무료로 시작하기
          </Link>
          <Link href="/login" className="bm-btn-secondary">
            로그인
          </Link>
        </div>
        <p className="mt-4 text-xs text-[var(--foreground-muted)]">
          이메일/비밀번호로 가입 → Gmail 연동은 가입 후 한 번 클릭.
        </p>
        {msg && <p className="mt-4 text-xs text-[var(--warning)]">{msg}</p>}
      </section>
    );
  }

  if (!data) {
    return (
      <div className="bm-card p-6 text-sm text-[var(--foreground-muted)]">
        에이전트 목록 불러오는 중…
      </div>
    );
  }

  const enabledCount = data.agents.filter((a) => a.activation?.enabled).length;
  const availableCount = data.agents.filter((a) => a.status === "available").length;

  return (
    <>
      {/* 상단 요약 */}
      <section className="bm-card-soft mb-5 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4 text-[14px]">
          <div>
            📧 <span className="font-semibold text-[var(--foreground)]">{data.accountInfo.gmailEmail ?? "Gmail 미연결"}</span>
          </div>
          <div>
            🤖 AI:{" "}
            <span
              className={
                "font-semibold " +
                (data.accountInfo.aiProvider === "none"
                  ? "text-[var(--warning)]"
                  : "text-[var(--accent-strong)]")
              }
            >
              {PROVIDER_LABEL[data.accountInfo.aiProvider]}
            </span>
          </div>
          <div className="ml-auto text-[12px] text-[var(--foreground-soft)]">
            활성 <b className="text-[var(--accent-strong)]">{enabledCount}</b> / 사용 가능 {availableCount} / 전체 {data.agents.length}
          </div>
        </div>
      </section>

      {msg && (
        <div className="bm-card-soft mb-4 px-4 py-2.5 text-[13px] text-[var(--foreground)]">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.agents.map((a) => (
          <AgentCard
            key={a.id}
            agent={a}
            toggling={toggling === a.id}
            onToggle={(enabled) => toggle(a.id, enabled)}
          />
        ))}
      </div>

      <p className="mt-8 text-center text-[12px] text-[var(--foreground-muted)]">
        💡 새 에이전트는 계속 추가됩니다. 원하는 자동화는 GitHub Issues로!
      </p>
    </>
  );
}

function AgentCard({
  agent,
  toggling,
  onToggle,
}: {
  agent: AgentItem;
  toggling: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  const isComingSoon = agent.status === "coming_soon";
  const isEnabled = !!agent.activation?.enabled;
  const canActivate = agent.prereqMet && !isComingSoon;

  return (
    <div
      className="bm-card relative flex flex-col p-5"
      style={
        isEnabled
          ? { borderColor: "var(--accent)", boxShadow: "0 0 0 3px var(--accent-soft)" }
          : isComingSoon
            ? { background: "var(--background-soft)", boxShadow: "none" }
            : undefined
      }
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={"text-4xl " + (isComingSoon ? "opacity-30" : "")}>{agent.emoji}</div>
        <StatusBadge isEnabled={isEnabled} isComingSoon={isComingSoon} canActivate={canActivate} />
      </div>

      <h3
        className={
          "bm-hero text-[20px] " +
          (isComingSoon ? "text-[var(--foreground-muted)]" : "text-[var(--foreground)]")
        }
      >
        {agent.name}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--foreground-soft)]">
        {agent.tagline}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="bm-chip">{CATEGORY_LABEL[agent.category]}</span>
        {agent.requirements.map((r) => (
          <span key={r.key} className="bm-chip">
            {r.label}
          </span>
        ))}
      </div>

      {!isComingSoon && !agent.prereqMet && agent.missingPrereqs.length > 0 && (
        <div className="bm-chip-warn mt-3 block rounded-xl p-2.5 text-[12px] leading-relaxed">
          ⚠ 활성화하려면 먼저 필요해요: <b>{agent.missingPrereqs.join(", ")}</b>
          <br />
          <Link href="/setup" className="underline">
            설정 페이지에서 연결 →
          </Link>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-soft)] pt-3">
        {isComingSoon ? (
          <span className="text-[12px] text-[var(--foreground-muted)]">곧 추가됩니다</span>
        ) : (
          <>
            <button
              onClick={() => onToggle(!isEnabled)}
              disabled={!canActivate || toggling}
              className={isEnabled ? "bm-btn-secondary" : "bm-btn-primary"}
            >
              {toggling ? "…" : isEnabled ? "비활성화" : "활성화"}
            </button>
            {agent.id === "email-reply" && (
              <Link
                href="/agent"
                className="text-[12px] text-[var(--accent-strong)] underline hover:text-[var(--accent)]"
              >
                상세 보기 →
              </Link>
            )}
            {isEnabled && agent.activation && (
              <span className="ml-auto text-[11px] text-[var(--foreground-muted)]">
                {new Date(agent.activation.activatedAt).toLocaleDateString("ko-KR")} 활성화
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  isEnabled,
  isComingSoon,
  canActivate,
}: {
  isEnabled: boolean;
  isComingSoon: boolean;
  canActivate: boolean;
}) {
  if (isComingSoon) {
    return <span className="bm-chip">곧 추가</span>;
  }
  if (isEnabled) {
    return (
      <span className="bm-chip-success">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
        동작 중
      </span>
    );
  }
  if (!canActivate) {
    return <span className="bm-chip-warn">준비 필요</span>;
  }
  return <span className="bm-chip">꺼짐</span>;
}
