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

type CatalogResponse = {
  agents: AgentItem[];
  accountInfo: { gmailEmail: string | null; aiProvider: "groq" | "gemini" | "openai" | "none" };
};

const PROVIDER_LABEL: Record<string, string> = {
  groq: "Groq (무료)",
  gemini: "Gemini",
  openai: "OpenAI",
  none: "미연결",
};

export default function CatalogClient() {
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    try {
      const r = await fetch("/api/agents");
      setData(await r.json());
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
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
      if (!d.ok) {
        setMsg(`⚠ ${d.error}`);
      } else {
        setMsg(enabled ? "✓ 에이전트를 활성화했어요" : "에이전트를 비활성화했어요");
      }
      await refresh();
    } catch (e) {
      setMsg(`⚠ ${(e as Error).message}`);
    } finally {
      setToggling(null);
    }
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/40">
        에이전트 목록을 불러오는 중…
      </div>
    );
  }

  const enabledCount = data.agents.filter((a) => a.activation?.enabled).length;
  const availableCount = data.agents.filter((a) => a.status === "available").length;

  return (
    <>
      {/* 계정/상태 요약 */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div>
            📧 <span className="text-white/80">{data.accountInfo.gmailEmail ?? "Gmail 미연결"}</span>
          </div>
          <div>
            🤖 AI:{" "}
            <span className={data.accountInfo.aiProvider === "none" ? "text-yellow-300" : "text-emerald-300"}>
              {PROVIDER_LABEL[data.accountInfo.aiProvider]}
            </span>
          </div>
          <div className="ml-auto text-xs text-white/50">
            활성: {enabledCount} / 사용 가능: {availableCount} / 전체: {data.agents.length}
          </div>
        </div>
      </section>

      {msg && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
          {msg}
        </div>
      )}

      {/* 에이전트 카드 그리드 */}
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

      <p className="mt-8 text-xs text-white/40">
        💡 새 에이전트는 계속 추가됩니다. 원하는 자동화가 있으면 GitHub Issues 에 알려주세요.
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
      className={
        "relative flex flex-col rounded-2xl border p-5 " +
        (isEnabled
          ? "border-emerald-400/40 bg-emerald-400/[0.04]"
          : isComingSoon
            ? "border-white/5 bg-white/[0.01]"
            : "border-white/10 bg-white/[0.03]")
      }
    >
      {/* 상단: 이모지 + 상태 배지 */}
      <div className="mb-3 flex items-start justify-between">
        <div className={"text-4xl " + (isComingSoon ? "opacity-30" : "")}>{agent.emoji}</div>
        <StatusBadge isEnabled={isEnabled} isComingSoon={isComingSoon} canActivate={canActivate} />
      </div>

      {/* 본문 */}
      <h3 className={"text-lg font-semibold " + (isComingSoon ? "text-white/50" : "text-white/95")}>
        {agent.name}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-white/55">{agent.tagline}</p>

      {/* 카테고리 + 필요 권한 */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
          {CATEGORY_LABEL[agent.category]}
        </span>
        {agent.requirements.map((r) => (
          <span
            key={r.key}
            className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50"
          >
            {r.label}
          </span>
        ))}
      </div>

      {/* 사전 조건 미충족 안내 */}
      {!isComingSoon && !agent.prereqMet && agent.missingPrereqs.length > 0 && (
        <div className="mt-3 rounded-md border border-yellow-400/20 bg-yellow-400/[0.06] px-2.5 py-1.5 text-[11px] text-yellow-200">
          ⚠ 활성화하려면 먼저 필요해요: <b>{agent.missingPrereqs.join(", ")}</b>
          <br />
          <Link href="/setup" className="underline">
            설정 페이지에서 연결 →
          </Link>
        </div>
      )}

      {/* 활성화/비활성화 토글 + 상세 링크 */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
        {isComingSoon ? (
          <span className="text-xs text-white/40">곧 추가됩니다</span>
        ) : (
          <>
            <button
              onClick={() => onToggle(!isEnabled)}
              disabled={!canActivate || toggling}
              className={
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 " +
                (isEnabled
                  ? "border border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                  : "bg-[var(--accent)] text-black")
              }
            >
              {toggling ? "…" : isEnabled ? "비활성화" : "활성화"}
            </button>
            {agent.id === "email-reply" && (
              <Link
                href="/agent"
                className="text-xs text-white/50 underline hover:text-white"
              >
                상세 상태 보기 →
              </Link>
            )}
            {isEnabled && agent.activation && (
              <span className="ml-auto text-[10px] text-white/40">
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
    return (
      <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/50">
        곧 추가
      </span>
    );
  }
  if (isEnabled) {
    return (
      <span className="flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        동작 중
      </span>
    );
  }
  if (!canActivate) {
    return (
      <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-300">
        준비 필요
      </span>
    );
  }
  return (
    <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/60">
      꺼짐
    </span>
  );
}
