"use client";

// 클라이언트 전용. lib/* 서버 모듈은 import 하지 않는다.

import { useEffect, useState } from "react";

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

const CATEGORY_COLOR: Record<string, string> = {
  needs_reply: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  newsletter: "bg-blue-400/15 text-blue-300 border-blue-400/30",
  promotion: "bg-pink-400/15 text-pink-300 border-pink-400/30",
  notification: "bg-zinc-400/15 text-zinc-300 border-zinc-400/30",
  spam: "bg-red-400/15 text-red-300 border-red-400/30",
  other: "bg-white/10 text-white/60 border-white/20",
};

export default function AgentClient() {
  const [gmail, setGmail] = useState<GmailStatus | null>(null);
  const [state, setState] = useState<AgentState | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [runningOnce, setRunningOnce] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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

  // URL 의 ?connected=1 / ?error=... 처리
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("connected")) {
      setMsg("✓ Gmail 연결 완료");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (q.get("error")) {
      setMsg(`⚠ Gmail 연결 실패: ${q.get("error")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
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
      setMsg("✓ 1회 실행 완료. 아래 로그를 확인하세요.");
    } catch {
      setMsg("⚠ 실행 실패");
    } finally {
      setRunningOnce(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Gmail 연결을 해제할까요? 저장된 리프레시 토큰이 삭제됩니다.")) return;
    await fetch("/api/gmail/disconnect", { method: "POST" });
    await refresh();
    setMsg("Gmail 연결을 해제했습니다.");
  }

  // === 렌더 ===

  return (
    <>
      {/* 메시지 배너 */}
      {msg && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
          {msg}
        </div>
      )}

      {/* Gmail 연결 카드 */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">1) Gmail 연결</h2>
          {gmail?.connected ? (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">
              연결됨
            </span>
          ) : (
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-xs text-white/50">
              미연결
            </span>
          )}
        </div>

        {gmail?.connected ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-white/80">📧 {gmail.email}</span>
            <button
              onClick={handleDisconnect}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              연결 해제
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {!gmail?.oauthAppConfigured && (
              <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-3 text-xs text-yellow-200">
                ⚠ 먼저{" "}
                <a href="/setup" className="underline">
                  /setup
                </a>{" "}
                에서 <b>GOOGLE_OAUTH_CLIENT_ID</b> 와{" "}
                <b>GOOGLE_OAUTH_CLIENT_SECRET</b> 을 저장하세요.{" "}
                Google Cloud Console 등록 방법은 <code>docs/SETUP_GMAIL_AUTOMATION.md</code> 참고.
              </div>
            )}
            <a
              href="/api/gmail/auth"
              className={
                "inline-block rounded-lg px-4 py-2 text-sm font-semibold " +
                (gmail?.oauthAppConfigured
                  ? "bg-[var(--accent)] text-black"
                  : "cursor-not-allowed bg-white/10 text-white/40")
              }
            >
              📨 Gmail 계정 연결하기
            </a>
          </div>
        )}
      </section>

      {/* 자동화 토글 */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">2) 자동 폴링</h2>
          {state?.enabled ? (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">
              ON · {state.intervalSec}초마다 체크
            </span>
          ) : (
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-xs text-white/50">
              OFF
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-white/50">
          ON으로 두면 백그라운드에서 받은편지함 새 메일을 주기적으로 확인하고,
          답장이 필요한 메일에 대해서만 임시보관함에 초안을 만듭니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleToggle}
            disabled={!gmail?.connected}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state?.enabled ? "OFF로 끄기" : "ON으로 켜기"}
          </button>
          <button
            onClick={handleRunOnce}
            disabled={!gmail?.connected || runningOnce}
            className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {runningOnce ? "실행 중…" : "지금 1회 실행"}
          </button>
        </div>
        {state?.lastRunAt && (
          <p className="mt-3 text-xs text-white/40">
            마지막 실행: {new Date(state.lastRunAt).toLocaleString("ko-KR")}
            {state.lastRunSummary && ` — ${state.lastRunSummary}`}
          </p>
        )}
        {state?.lastError && (
          <p className="mt-1 text-xs text-red-300">⚠ {state.lastError}</p>
        )}
      </section>

      {/* 처리 로그 */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">3) 최근 처리 로그</h2>
          <span className="text-xs text-white/40">최근 {log.length}건</span>
        </div>
        {log.length === 0 ? (
          <p className="text-xs text-white/40">
            아직 처리한 메일이 없습니다. 위에서 Gmail을 연결하고 "지금 1회 실행"을 눌러보세요.
          </p>
        ) : (
          <div className="space-y-2">
            {log.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-1 rounded-lg border border-white/10 bg-black/30 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold " +
                      (CATEGORY_COLOR[e.category] ?? CATEGORY_COLOR.other)
                    }
                  >
                    {CATEGORY_LABEL[e.category] ?? e.category}
                  </span>
                  <span className="text-xs text-white/40">
                    {new Date(e.processedAt).toLocaleString("ko-KR")}
                  </span>
                  {e.draftId && (
                    <a
                      href={`https://mail.google.com/mail/u/0/#drafts`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300 hover:bg-emerald-400/20"
                    >
                      ✏️ Gmail 임시보관함에서 보기
                    </a>
                  )}
                  {e.draftError && (
                    <span className="ml-auto rounded-md border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-xs text-red-300">
                      초안 실패: {e.draftError}
                    </span>
                  )}
                </div>
                <div className="truncate text-sm font-medium text-white/90">
                  {e.subject || "(제목 없음)"}
                </div>
                <div className="truncate text-xs text-white/50">{e.from}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
