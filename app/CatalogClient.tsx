"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORY_LABEL, type AgentMeta } from "@/lib/agents";
import Landing from "./Landing";

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

  // saas + 미로그인 → 스크롤 랜딩
  if (me.mode === "saas" && !me.user) {
    return <Landing msg={msg} />;
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
      {/* 상단 요약 — 사용자에게 의미 있는 정보 */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="bm-card-soft px-4 py-3.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            동작 중인 에이전트
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[24px] font-bold text-[var(--hot)]">{enabledCount}</span>
            <span className="text-[12px] text-[var(--foreground-soft)]">/ {availableCount}개 사용 가능</span>
          </div>
        </div>
        <div className="bm-card-soft px-4 py-3.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            Gmail 연결
          </div>
          <div className="mt-1 text-[14px] font-semibold text-[var(--foreground)]">
            {data.accountInfo.gmailEmail ? (
              <span className="text-[var(--success)]">✓ 연결됨</span>
            ) : (
              <span className="text-[var(--warning)]">미연결</span>
            )}
          </div>
        </div>
        <div className="bm-card-soft px-4 py-3.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            새로운 에이전트
          </div>
          <div className="mt-1 text-[14px] font-semibold text-[var(--foreground)]">
            🚀 곧 추가 예정
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
