"use client";

// 클라이언트 전용. lib/* 서버 모듈은 import 하지 않는다.
// 비개발자 친화: 모든 영어 상태/단추 라벨을 한국어로.

import { useEffect, useMemo, useState } from "react";

type AgentState = {
  enabled: boolean;
  intervalSec: number;
  lastRunAt: string | null;
  lastRunSummary: string | null;
  lastError: string | null;
};

type LogEntry = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  category: string;
  draftId?: string;
  draftError?: string;
  processedAt: string;
};

type GmailStatus = {
  connected: boolean;
  email: string | null;
  oauthAppConfigured: boolean;
};

const CATEGORY_LABEL: Record<string, string> = {
  needs_reply: "답장 필요",
  newsletter: "뉴스레터",
  promotion: "광고",
  notification: "알림",
  spam: "스팸",
  other: "기타",
};

const ERROR_LABEL: Record<string, string> = {
  not_owner:
    "이 인스턴스의 소유자 Gmail만 연결할 수 있어요. 다른 계정으로 시도하셨네요.",
  state_mismatch: "보안 토큰이 일치하지 않습니다. 다시 시도해 주세요.",
  missing_code: "인증 정보가 누락됐어요. 다시 시도해 주세요.",
  token_exchange_failed: "Google과 인증 교환 실패 — /설정에서 Client ID/Secret을 확인하세요.",
};

export default function AgentClient() {
  const [gmail, setGmail] = useState<GmailStatus | null>(null);
  const [state, setState] = useState<AgentState | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [runningOnce, setRunningOnce] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  async function refresh() {
    try {
      const [g, s] = await Promise.all([
        fetch("/api/gmail/status").then((r) => r.json()),
        fetch("/api/agent/status").then((r) => r.json()),
      ]);
      setGmail(g);
      setState(s.state);
      setLog(s.log ?? []);
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
    if (q.get("connected")) {
      setMsg("✓ Gmail 연결을 완료했어요.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (q.get("error")) {
      const code = q.get("error") || "";
      setMsg(`⚠ ${ERROR_LABEL[code] ?? code}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
    // 디버깅/캡처용: /agent?log=1 로 들어오면 처리 로그 펼침
    if (q.get("log") === "1") setShowLog(true);
  }, []);

  async function handleToggle() {
    if (!state) return;
    const r = await fetch("/api/agent/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !state.enabled }),
    });
    const data = await r.json();
    setState(data.state);
  }

  async function handleRunOnce() {
    setRunningOnce(true);
    setMsg(null);
    try {
      const r = await fetch("/api/agent/run-once", { method: "POST" });
      const data = await r.json();
      setState(data.state);
      await refresh();
      setMsg("✓ 한 번 실행했어요. 받은편지함을 살펴봤습니다.");
    } catch {
      setMsg("⚠ 실행에 실패했어요.");
    } finally {
      setRunningOnce(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Gmail 연결을 해제할까요?")) return;
    await fetch("/api/gmail/disconnect", { method: "POST" });
    await refresh();
    setMsg("Gmail 연결을 해제했어요.");
  }

  const isRunning = useMemo(
    () => Boolean(gmail?.connected && state?.enabled),
    [gmail?.connected, state?.enabled]
  );

  const replyCount = useMemo(
    () => log.filter((e) => e.draftId).length,
    [log]
  );

  // 다음 안내 — 다음에 형이 해야 할 일이 뭔지 한 줄로
  const nextStepHint = useMemo(() => {
    if (!gmail?.oauthAppConfigured) {
      return {
        text: "Google 연결 정보를 먼저 설정 페이지에서 저장해 주세요.",
        action: { label: "설정 페이지로", href: "/setup" },
      };
    }
    if (!gmail?.connected) {
      return {
        text: "이제 본인 Gmail로 로그인해서 권한을 허락해 주세요.",
        action: { label: "Gmail 연결하기 →", href: "/api/gmail/auth" },
      };
    }
    if (!state?.enabled) {
      return {
        text: "자동 답장을 시작하려면 '자동으로 켜기' 버튼을 눌러주세요.",
        action: null,
      };
    }
    return {
      text: "자동 답장이 동작 중이에요. 받은편지함에 새 메일이 오면 자동으로 임시보관함에 답장 초안을 만들어 둡니다.",
      action: null,
    };
  }, [gmail, state]);

  return (
    <>
      {msg && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
          {msg}
        </div>
      )}

      {/* 큰 상태 카드 */}
      <section
        className={
          "mb-6 rounded-2xl border p-6 " +
          (isRunning
            ? "border-emerald-400/30 bg-emerald-400/[0.06]"
            : "border-white/10 bg-white/[0.03]")
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={
                "inline-block h-3 w-3 rounded-full " +
                (isRunning ? "bg-emerald-400 animate-pulse" : "bg-white/30")
              }
            />
            <span className="text-3xl font-bold tracking-tight">
              {isRunning ? "동작 중" : "꺼져 있어요"}
            </span>
          </div>
          <div className="text-xs text-white/40">
            {gmail?.connected ? `📧 ${gmail.email}` : "아직 Gmail 미연결"}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Stat label="Gmail" value={gmail?.connected ? "연결됨" : "미연결"} ok={!!gmail?.connected} />
          <Stat
            label="자동 확인"
            value={state?.enabled ? `${Math.round((state.intervalSec || 300) / 60)}분마다` : "꺼짐"}
            ok={!!state?.enabled}
          />
          <Stat label="만든 답장 초안" value={`${replyCount}건`} ok={replyCount > 0} />
        </div>

        {state?.lastRunAt && (
          <p className="mt-4 text-xs text-white/50">
            마지막 확인: {new Date(state.lastRunAt).toLocaleString("ko-KR")}
            {state.lastRunSummary && ` — ${state.lastRunSummary}`}
          </p>
        )}
        {state?.lastError && (
          <p className="mt-1 text-xs text-red-300">⚠ {state.lastError}</p>
        )}

        {/* 다음 단계 안내 */}
        <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
          <div className="text-xs uppercase tracking-wider text-white/40">다음 단계</div>
          <div className="mt-1 text-white/85">{nextStepHint.text}</div>
          {nextStepHint.action && (
            <a
              href={nextStepHint.action.href}
              className="mt-3 inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black"
            >
              {nextStepHint.action.label}
            </a>
          )}
        </div>
      </section>

      {/* 조작 영역 */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-base font-semibold">버튼</h2>

        <div className="flex flex-wrap gap-2">
          {gmail?.connected ? (
            <button
              onClick={handleDisconnect}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
            >
              Gmail 연결 끊기
            </button>
          ) : (
            <a
              href="/api/gmail/auth"
              className={
                "inline-block rounded-lg px-4 py-2 text-sm font-semibold " +
                (gmail?.oauthAppConfigured
                  ? "bg-[var(--accent)] text-black"
                  : "cursor-not-allowed bg-white/10 text-white/40")
              }
            >
              📨 Gmail 연결하기
            </a>
          )}

          <button
            onClick={handleToggle}
            disabled={!gmail?.connected}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state?.enabled ? "자동 답장 멈추기" : "자동 답장 켜기"}
          </button>

          <button
            onClick={handleRunOnce}
            disabled={!gmail?.connected || runningOnce}
            className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {runningOnce ? "확인 중…" : "지금 한 번 확인"}
          </button>

          <button
            onClick={() => setShowLog((v) => !v)}
            className="ml-auto rounded-lg border border-white/15 px-3 py-2 text-xs text-white/50 hover:bg-white/5"
          >
            {showLog ? "기록 숨기기" : "어떤 메일을 봤는지 보기"}
          </button>
        </div>
      </section>

      {/* 처리 로그 */}
      {showLog && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-3 text-base font-semibold">최근 본 메일</h2>
          {log.length === 0 ? (
            <p className="text-xs text-white/40">
              아직 확인한 메일이 없어요.
            </p>
          ) : (
            <div className="space-y-2">
              {log.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-col gap-1 rounded-lg border border-white/10 bg-black/30 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-semibold">
                      {CATEGORY_LABEL[e.category] ?? e.category}
                    </span>
                    <span className="text-white/40">
                      {new Date(e.processedAt).toLocaleString("ko-KR")}
                    </span>
                    {e.draftId && (
                      <a
                        href="https://mail.google.com/mail/u/0/#drafts"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-emerald-300 hover:bg-emerald-400/20"
                      >
                        ✏️ 임시보관함에서 보기
                      </a>
                    )}
                    {e.draftError && (
                      <span className="ml-auto rounded-md border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-red-300">
                        초안 실패
                      </span>
                    )}
                  </div>
                  <div className="truncate text-sm text-white/90">
                    {e.subject || "(제목 없음)"}
                  </div>
                  <div className="truncate text-xs text-white/50">{e.from}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

function Stat({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className={"mt-1 text-sm font-semibold " + (ok ? "text-emerald-300" : "text-white/70")}>
        {value}
      </div>
    </div>
  );
}
