"use client";

// 클라이언트 전용. 비밀값 원문은 절대 받지 않고, 마스킹된 status 만 사용.

import Link from "next/link";
import { useEffect, useState } from "react";

type Mode = "real" | "mock";

type SetupStatus = {
  openai: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  google: {
    clientIdConfigured: boolean;
    clientSecretConfigured: boolean;
    clientIdMasked: string;
    source: "env" | "stored" | "mixed" | "none";
  };
  smtp: { configured: boolean };
  kakao: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  modes: { ai: Mode; email: Mode; kakao: Mode };
  encryption: { configured: boolean };
  ownerEmail: string | null;
};

type SaveResp = { ok: true; status: SetupStatus } | { ok: false; error: string };
type TestResp =
  | { ok: true; mode: Mode; message: string }
  | { ok: false; mode?: Mode; error: string };

export default function SetupClient() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // 입력 필드
  const [openaiKey, setOpenaiKey] = useState("");
  const [gClientId, setGClientId] = useState("");
  const [gClientSecret, setGClientSecret] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 결과 상태
  type ResultState = { kind: "loading" | "success" | "error"; text: string; mock?: boolean };
  const [openaiResult, setOpenaiResult] = useState<ResultState | null>(null);
  const [googleResult, setGoogleResult] = useState<ResultState | null>(null);

  async function refreshStatus() {
    setLoadingStatus(true);
    try {
      const r = await fetch("/api/setup/status");
      const data = (await r.json()) as SetupStatus;
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function save(updates: Record<string, string>, sectionResult: (r: ResultState) => void) {
    sectionResult({ kind: "loading", text: "저장 중…" });
    try {
      const r = await fetch("/api/setup/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = (await r.json()) as SaveResp;
      if (!r.ok || !data.ok) {
        const err = (data as { error?: string }).error ?? "저장 실패";
        sectionResult({ kind: "error", text: `✗ ${err}` });
        return;
      }
      setStatus(data.status);
      sectionResult({ kind: "success", text: "✓ 저장 완료" });
    } catch (e) {
      sectionResult({ kind: "error", text: `✗ ${(e as Error).message}` });
    }
  }

  async function testOpenAI() {
    setOpenaiResult({ kind: "loading", text: "테스트 중…" });
    try {
      const r = await fetch("/api/setup/test-openai", { method: "POST" });
      const data = (await r.json()) as TestResp;
      if (!data.ok) {
        setOpenaiResult({ kind: "error", text: `✗ ${(data as { error?: string }).error ?? "실패"}` });
        return;
      }
      setOpenaiResult({
        kind: "success",
        text: `✓ ${data.message}`,
        mock: data.mode === "mock",
      });
    } catch (e) {
      setOpenaiResult({ kind: "error", text: `✗ ${(e as Error).message}` });
    }
  }

  function ResultLine({ r }: { r: ResultState | null }) {
    if (!r) return null;
    const color =
      r.kind === "loading"
        ? "text-white/60"
        : r.kind === "error"
          ? "text-red-400"
          : r.mock
            ? "text-yellow-300"
            : "text-emerald-400";
    return <p className={"mt-3 text-sm " + color}>{r.text}</p>;
  }

  function StatusPill({ ok, ifTrue, ifFalse }: { ok: boolean; ifTrue: string; ifFalse: string }) {
    return (
      <span
        className={
          "rounded-full border px-2 py-0.5 text-[10px] font-semibold " +
          (ok
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border-yellow-400/30 bg-yellow-400/10 text-yellow-300")
        }
      >
        {ok ? ifTrue : ifFalse}
      </span>
    );
  }

  return (
    <>
      {/* 자물쇠 키 경고 */}
      {status && !status.encryption.configured && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          <div className="font-semibold">⚠ 자물쇠 키(APP_ENCRYPTION_KEY)가 없어요</div>
          <p className="mt-1 text-xs">
            저장 버튼이 동작하지 않습니다. 서버의 <code>.env.local</code> 파일에 한 줄 추가하고 서버를 재시작해주세요.
            <br />
            <code className="rounded bg-black/40 px-1.5 py-0.5">openssl rand -base64 32</code>{" "}
            의 결과를 <code className="rounded bg-black/40 px-1.5 py-0.5">APP_ENCRYPTION_KEY=...</code> 뒤에 붙여넣기.
          </p>
        </div>
      )}

      {/* OWNER 안내 */}
      {status?.ownerEmail && (
        <div className="mb-4 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-200">
          🔒 소유자 전용 모드: <b>{status.ownerEmail}</b> 만 Gmail 연결 가능
        </div>
      )}

      {/* === 1) OpenAI === */}
      <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold">1) OpenAI API 키</h2>
          {status && (
            <StatusPill ok={status.openai.configured} ifTrue="저장됨" ifFalse="비어있음" />
          )}
        </div>
        <p className="mb-3 text-xs text-white/60">
          AI에게 답장 초안을 부탁할 때 사용합니다. <b>없으면 가짜 샘플(MOCK)만 출력</b>되고 실제 답장은 안 만들어져요.{" "}
          <a
            href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SETUP_OPENAI.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-white/70 hover:text-white"
          >
            발급 방법 보기 ↗
          </a>
        </p>
        {status?.openai.configured && (
          <p className="mb-2 text-xs text-white/40">
            현재 저장된 값: <code>{status.openai.masked}</code> ({status.openai.source})
          </p>
        )}
        <label className="mb-1 block text-xs text-white/60">OpenAI에서 발급한 키 (sk-... 로 시작)</label>
        <input
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (!openaiKey.trim() || !status?.encryption.configured) return;
              void save({ OPENAI_API_KEY: openaiKey }, setOpenaiResult).then(() =>
                setOpenaiKey("")
              );
            }}
            disabled={!openaiKey.trim() || !status?.encryption.configured}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            저장
          </button>
          <button
            onClick={testOpenAI}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            연결 테스트
          </button>
        </div>
        <ResultLine r={openaiResult} />
      </section>

      {/* === 2) Google OAuth === */}
      <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold">
            2) Google 연결 (Gmail 자동 답장에 필요)
          </h2>
          {status && (
            <StatusPill
              ok={status.google.clientIdConfigured && status.google.clientSecretConfigured}
              ifTrue="저장됨"
              ifFalse="비어있음"
            />
          )}
        </div>
        <p className="mb-3 text-xs leading-relaxed text-white/60">
          Gmail 받은편지함을 읽고 임시보관함에 답장 초안을 만들려면 Google에게 본인 명의의 OAuth 앱이 한 번 필요합니다. 약 15분 클릭 작업 1회로 끝나요.
          <br />
          <a
            href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SETUP_GMAIL_AUTOMATION.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-white/70 hover:text-white"
          >
            클릭 가이드 보기 ↗ (Google Cloud Console 등록 7단계)
          </a>
        </p>
        {status?.google.clientIdConfigured && (
          <p className="mb-2 text-xs text-white/40">
            현재 저장됨 — Client ID: <code>{status.google.clientIdMasked}</code> · Secret:{" "}
            {status.google.clientSecretConfigured ? "✓ 있음" : "✗ 비어있음"} ({status.google.source})
          </p>
        )}

        <label className="mb-1 mt-2 block text-xs text-white/60">
          Google Client ID (예: <code>123456-abc.apps.googleusercontent.com</code>)
        </label>
        <input
          type="text"
          value={gClientId}
          onChange={(e) => setGClientId(e.target.value)}
          placeholder="123456-abc.apps.googleusercontent.com"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />

        <label className="mb-1 mt-3 block text-xs text-white/60">
          Google Client Secret (예: <code>GOCSPX-xxxx</code>)
        </label>
        <input
          type="password"
          value={gClientSecret}
          onChange={(e) => setGClientSecret(e.target.value)}
          placeholder="GOCSPX-xxxxxxxxxxxxxxxx"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (!status?.encryption.configured) return;
              const updates: Record<string, string> = {};
              if (gClientId.trim()) updates.GOOGLE_OAUTH_CLIENT_ID = gClientId.trim();
              if (gClientSecret.trim()) updates.GOOGLE_OAUTH_CLIENT_SECRET = gClientSecret.trim();
              if (Object.keys(updates).length === 0) return;
              void save(updates, setGoogleResult).then(() => {
                setGClientId("");
                setGClientSecret("");
              });
            }}
            disabled={!status?.encryption.configured}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            저장
          </button>
          <Link
            href="/agent"
            className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-400/15"
          >
            저장 후 Gmail 연결하러 가기 →
          </Link>
        </div>
        <ResultLine r={googleResult} />
      </section>

      {/* === 고급 설정 (접힘) === */}
      <section className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex w-full items-center justify-between text-left text-sm text-white/50 hover:text-white/80"
        >
          <span>
            🔧 고급 설정 (이메일 전송 / 카카오톡 — 자동 답장에는 필요 없음)
          </span>
          <span className="text-xs">{showAdvanced ? "접기 ▲" : "펼치기 ▼"}</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-xs text-white/60">
            <p>
              이 두 가지는 <b>자동 답장 에이전트와는 무관</b>합니다. 부가 기능 (
              <Link href="/generators/email-reply" className="underline">수동 답장 자판기</Link> 등)을 사용하실 때
              결과를 본인 이메일이나 카카오톡으로 받고 싶을 때만 채우세요.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <b>이메일 전송 (SMTP)</b>:{" "}
                <StatusPill ok={status?.smtp.configured ?? false} ifTrue="저장됨" ifFalse="비어있음" /> · 서버의{" "}
                <code>.env.local</code> 에서 <code>SMTP_HOST / SMTP_USER / SMTP_PASS</code> 직접 편집 →{" "}
                <a
                  href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SETUP_GMAIL.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  가이드 ↗
                </a>
              </li>
              <li>
                <b>카카오톡 나에게 보내기</b>:{" "}
                <StatusPill ok={status?.kakao.configured ?? false} ifTrue="저장됨" ifFalse="비어있음" /> · 서버의{" "}
                <code>.env.local</code> 에서 <code>KAKAO_ACCESS_TOKEN</code> 직접 편집 →{" "}
                <a
                  href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SETUP_KAKAO.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  가이드 ↗
                </a>
              </li>
            </ul>
            <p className="text-white/40">
              UI에서 직접 입력 받으면 비개발자가 헷갈리는 항목이 많아서, 고급 사용자가 서버에서 편집하도록 분리했습니다.
            </p>
          </div>
        )}
      </section>

      {loadingStatus && (
        <p className="text-xs text-white/40">현재 설정을 불러오는 중…</p>
      )}

      <p className="mt-8 text-xs text-white/40">
        ※ 입력한 값은 외부로 전송되지 않으며, 이 서버의 <code>.hiailab/</code>{" "}
        폴더(권한 600)에 AES-256-GCM 암호화되어 저장됩니다. Git에 절대 커밋되지 않습니다.
      </p>
    </>
  );
}
