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
      setMsg("Gmail 연결이 완료되었습니다.");
      window.history.replaceState({}, "", "/");
      void refresh();
    } else if (q.get("error")) {
      const code = q.get("error") || "";
      const map: Record<string, string> = {
        not_owner: "이 인스턴스의 소유자(OWNER_EMAIL) 메일만 연결할 수 있습니다.",
        state_mismatch: "보안 토큰이 일치하지 않습니다. 다시 시도해 주세요.",
        missing_code: "OAuth 인증 코드가 누락되었습니다.",
        token_exchange_failed: "Google과의 인증 교환에 실패했습니다.",
        no_email: "이메일 정보를 받지 못했습니다.",
      };
      setMsg(map[code] ?? code);
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
      if (!d.ok) setMsg(d.error);
      else setMsg(enabled ? "에이전트가 활성화되었습니다." : "에이전트가 비활성화되었습니다.");
      await refresh();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setToggling(null);
    }
  }

  // 초기 로딩 — 스켈레톤 (텍스트 X)
  if (!me) {
    return <LandingSkeleton />;
  }

  // saas + 미로그인 → 풀스크린 Landing (MainHeader/footer 없음)
  if (me.mode === "saas" && !me.user) {
    return <Landing msg={msg} />;
  }

  // 로그인 상태 — 대시보드
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <DashboardHeader me={me} />

      {!data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardSummary data={data} />

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
            새 에이전트는 계속 추가됩니다. 요청은{" "}
            <a
              href="https://github.com/sungpyo9053/hiailab/issues"
              target="_blank"
              className="underline hover:text-[var(--foreground)]"
            >
              GitHub Issues
            </a>
            로 알려주세요.
          </p>
        </>
      )}

      <footer className="mt-14 border-t border-[var(--border)] pt-6 text-[11px] text-[var(--foreground-muted)]">
        API 키와 개인 데이터는 사용자의 실행 환경에서 처리됩니다.
        자동 생성된 답장은 즉시 발송되지 않으며, Gmail 임시보관함에서 사용자가 직접 확인 후 발송합니다.
      </footer>
    </main>
  );
}

function DashboardHeader({ me }: { me: Me }) {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <header className="mb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "var(--gradient-hero)" }}
            >
              <span className="text-white text-[14px] font-black">H</span>
            </span>
            <span className="bm-hero text-[24px] text-[var(--foreground)]">HI AI LAB</span>
          </Link>
          <p className="mt-3 text-[14px] text-[var(--foreground-soft)]">
            활성화된 에이전트와 실행 결과를 확인하세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {me.user && (
            <span className="bm-chip">
              {me.user.email}
              {me.user.role === "admin" && (
                <span className="ml-1.5 rounded bg-[var(--accent)] px-1.5 py-px text-[9px] font-bold text-white">
                  ADMIN
                </span>
              )}
            </span>
          )}
          {me.user?.role === "admin" && (
            <Link href="/admin" className="bm-btn-secondary">
              어드민
            </Link>
          )}
          {me.user && (
            <Link href="/setup" className="bm-btn-secondary">
              설정
            </Link>
          )}
          {me.mode === "saas" && me.user && (
            <button onClick={logout} className="bm-btn-ghost">
              로그아웃
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function DashboardSummary({ data }: { data: { agents: AgentItem[]; accountInfo: AccountInfo } }) {
  const enabledCount = data.agents.filter((a) => a.activation?.enabled).length;
  const availableCount = data.agents.filter((a) => a.status === "available").length;
  return (
    <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <SummaryStat
        label="동작 중인 에이전트"
        value={`${enabledCount}`}
        sub={`/ ${availableCount} available`}
      />
      <SummaryStat
        label="Gmail 연결"
        value={data.accountInfo.gmailEmail ? "Connected" : "Not connected"}
        valueColor={data.accountInfo.gmailEmail ? "var(--success)" : "var(--warning)"}
      />
      <SummaryStat label="AI Provider" value={data.accountInfo.aiProvider.toUpperCase()} />
    </section>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="bm-card-soft px-4 py-3.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          className="text-[20px] font-bold"
          style={{ color: valueColor ?? "var(--foreground)" }}
        >
          {value}
        </span>
        {sub && <span className="text-[12px] text-[var(--foreground-soft)]">{sub}</span>}
      </div>
    </div>
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
      style={isEnabled ? { borderColor: "var(--accent)" } : undefined}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={"text-[28px] " + (isComingSoon ? "opacity-30" : "")}>{agent.emoji}</div>
        <StatusBadge isEnabled={isEnabled} isComingSoon={isComingSoon} canActivate={canActivate} />
      </div>

      <h3
        className={
          "text-[17px] font-bold " +
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
          <span key={r.key} className="bm-chip mono text-[10px]">
            {r.label}
          </span>
        ))}
      </div>

      {!isComingSoon && !agent.prereqMet && agent.missingPrereqs.length > 0 && (
        <div className="bm-chip-warn mt-3 block rounded-lg p-2.5 text-[12px] leading-relaxed">
          활성화하려면 먼저 필요합니다: <b>{agent.missingPrereqs.join(", ")}</b>
          <br />
          <Link href="/setup" className="underline">
            설정 페이지에서 연결 →
          </Link>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-soft)] pt-3">
        {isComingSoon ? (
          <span className="text-[12px] text-[var(--foreground-muted)]">곧 출시 예정</span>
        ) : (
          <>
            <button
              onClick={() => onToggle(!isEnabled)}
              disabled={!canActivate || toggling}
              className={isEnabled ? "bm-btn-secondary" : "bm-btn-primary"}
            >
              {toggling ? "처리 중" : isEnabled ? "비활성화" : "활성화"}
            </button>
            {agent.id === "email-reply" && (
              <Link
                href="/agent"
                className="text-[12px] text-[var(--foreground-soft)] underline hover:text-[var(--foreground)]"
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
  if (isComingSoon) return <span className="bm-chip">Coming soon</span>;
  if (isEnabled) {
    return (
      <span className="bm-chip-success">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
        Running
      </span>
    );
  }
  if (!canActivate) return <span className="bm-chip-warn">Setup required</span>;
  return <span className="bm-chip">Inactive</span>;
}

// === 스켈레톤 UI (로딩 텍스트 X) ===
function LandingSkeleton() {
  return (
    <div className="-mx-5">
      <div className="bm-glass sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="h-7 w-32 rounded-md bg-[var(--background-elev)] animate-pulse" />
          <div className="h-7 w-20 rounded-md bg-[var(--background-elev)] animate-pulse" />
        </div>
      </div>
      <section className="relative mx-auto max-w-6xl px-5 pt-20 pb-32 sm:pt-28">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <div className="mx-auto h-6 w-40 rounded-full bg-[var(--background-elev)] animate-pulse" />
          <div className="mx-auto h-14 w-3/4 rounded-lg bg-[var(--background-elev)] animate-pulse" />
          <div className="mx-auto h-14 w-2/3 rounded-lg bg-[var(--background-elev)] animate-pulse" />
          <div className="mx-auto h-4 w-1/2 rounded bg-[var(--background-elev)] animate-pulse" />
          <div className="mt-8 flex justify-center gap-3">
            <div className="h-12 w-40 rounded-lg bg-[var(--background-elev)] animate-pulse" />
            <div className="h-12 w-32 rounded-lg bg-[var(--background-elev)] animate-pulse" />
          </div>
        </div>
        <div className="mx-auto mt-16 h-[420px] max-w-5xl rounded-2xl border border-[var(--border)] bg-[var(--background-elev)] animate-pulse" />
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--background-elev)] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-[var(--background-elev)] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
