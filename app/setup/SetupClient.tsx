"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Mode = "real" | "mock";

type SetupStatus = {
  openai: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  gemini: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  groq: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  activeProvider: "groq" | "gemini" | "openai" | "none";
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

  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [gClientId, setGClientId] = useState("");
  const [gClientSecret, setGClientSecret] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  type ResultState = { kind: "loading" | "success" | "error"; text: string; mock?: boolean };
  const [groqResult, setGroqResult] = useState<ResultState | null>(null);
  const [geminiResult, setGeminiResult] = useState<ResultState | null>(null);
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
        sectionResult({ kind: "error", text: `✗ ${(data as { error?: string }).error ?? "저장 실패"}` });
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
      setOpenaiResult({ kind: "success", text: `✓ ${data.message}`, mock: data.mode === "mock" });
    } catch (e) {
      setOpenaiResult({ kind: "error", text: `✗ ${(e as Error).message}` });
    }
  }

  function ResultLine({ r }: { r: ResultState | null }) {
    if (!r) return null;
    const color =
      r.kind === "loading"
        ? "text-[var(--foreground-soft)]"
        : r.kind === "error"
          ? "text-[var(--danger)]"
          : r.mock
            ? "text-[var(--warning)]"
            : "text-[var(--success)]";
    return <p className={"mt-3 text-[13px] " + color}>{r.text}</p>;
  }

  function StatusPill({ ok, ifTrue, ifFalse }: { ok: boolean; ifTrue: string; ifFalse: string }) {
    return (
      <span className={ok ? "bm-chip-success" : "bm-chip-warn"}>{ok ? ifTrue : ifFalse}</span>
    );
  }

  return (
    <>
      {status && !status.encryption.configured && (
        <div className="mb-6 rounded-2xl border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-[13px] text-[var(--danger)]">
          <div className="font-bold">⚠ 자물쇠 키(APP_ENCRYPTION_KEY)가 없어요</div>
          <p className="mt-1 text-[12px]">
            저장 버튼이 동작하지 않습니다. 서버 <code>.env.local</code> 에 한 줄 추가하고 재시작.
          </p>
        </div>
      )}

      {status?.ownerEmail && (
        <div className="mb-4 rounded-xl border border-[var(--success)] bg-[var(--success-soft)] px-3 py-2 text-[12px] text-[var(--foreground)]">
          🔒 어드민: <b>{status.ownerEmail}</b>
        </div>
      )}

      {/* === 1) AI 키 === */}
      <section className="bm-card mb-5 p-6">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="bm-hero text-[18px] text-[var(--foreground)]">1) AI 키 (하나만 있으면 됨)</h2>
          {status && status.activeProvider !== "none" && (
            <span className="bm-chip-success">
              사용 중: {status.activeProvider === "groq" ? "Groq" : status.activeProvider === "gemini" ? "Gemini" : "OpenAI"}
            </span>
          )}
        </div>
        <p className="mb-5 text-[13px] leading-relaxed text-[var(--foreground-soft)]">
          AI가 메일을 분류하고 답장 초안을 작성할 때 사용. <b>Groq가 가장 추천 (무료, 카드 등록 X)</b>.
          여러 개 입력하면 우선순위: Groq → Gemini → OpenAI.
        </p>

        {/* Groq (추천) */}
        <div className="mb-4 rounded-2xl border-2 border-[var(--hot)] bg-[var(--hot-soft)] p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-bold text-[var(--foreground)]">🥇 Groq (추천 · 진짜 무료)</span>
            {status && <StatusPill ok={status.groq.configured} ifTrue="저장됨" ifFalse="비어있음" />}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[12px] text-[var(--accent)] underline hover:text-[var(--accent-strong)]"
            >
              발급받기 ↗
            </a>
          </div>
          <p className="mb-2 text-[12px] text-[var(--foreground-soft)]">
            Llama 3.3 70B · 분당 30회 / 일 14,400회 · 카드 등록 없이 즉시 발급
          </p>
          {status?.groq.configured && (
            <p className="mb-2 text-[11px] text-[var(--foreground-muted)]">
              저장됨: <code>{status.groq.masked}</code>
            </p>
          )}
          <input
            type="password"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full rounded-[12px] border border-[var(--border)] px-3 py-2.5 text-[14px] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (!groqKey.trim() || !status?.encryption.configured) return;
                void save({ GROQ_API_KEY: groqKey }, setGroqResult).then(() => setGroqKey(""));
              }}
              disabled={!groqKey.trim() || !status?.encryption.configured}
              className="bm-btn-hot"
              style={{ padding: "8px 14px", fontSize: 12 }}
            >
              저장
            </button>
          </div>
          <ResultLine r={groqResult} />
        </div>

        {/* Gemini */}
        <details className="mb-3 rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-4">
          <summary className="cursor-pointer text-[13px] font-semibold text-[var(--foreground-soft)]">
            🔷 Google Gemini — 카드 등록 필요 {status?.gemini.configured && <span className="bm-chip-success ml-2">저장됨</span>}
          </summary>
          <div className="mt-3">
            <p className="mb-2 text-[12px] text-[var(--foreground-soft)]">
              Google Cloud 결제 등록 후 사용 가능. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">발급 ↗</a>
            </p>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-[12px] border border-[var(--border)] bg-white px-3 py-2.5 text-[14px]"
            />
            <button
              onClick={() => {
                if (!geminiKey.trim() || !status?.encryption.configured) return;
                void save({ GEMINI_API_KEY: geminiKey }, setGeminiResult).then(() => setGeminiKey(""));
              }}
              disabled={!geminiKey.trim() || !status?.encryption.configured}
              className="bm-btn-secondary mt-2"
              style={{ padding: "8px 14px", fontSize: 12 }}
            >
              저장
            </button>
            <ResultLine r={geminiResult} />
          </div>
        </details>

        {/* OpenAI */}
        <details className="rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-4">
          <summary className="cursor-pointer text-[13px] font-semibold text-[var(--foreground-soft)]">
            🔵 OpenAI — 유료 (pay-as-you-go) {status?.openai.configured && <span className="bm-chip-success ml-2">저장됨</span>}
          </summary>
          <div className="mt-3">
            <p className="mb-2 text-[12px] text-[var(--foreground-soft)]">
              답장 1건 ≈ ₩1~2. <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">발급 ↗</a>
            </p>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-[12px] border border-[var(--border)] bg-white px-3 py-2.5 text-[14px]"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (!openaiKey.trim() || !status?.encryption.configured) return;
                  void save({ OPENAI_API_KEY: openaiKey }, setOpenaiResult).then(() => setOpenaiKey(""));
                }}
                disabled={!openaiKey.trim() || !status?.encryption.configured}
                className="bm-btn-secondary"
                style={{ padding: "8px 14px", fontSize: 12 }}
              >
                저장
              </button>
              <button onClick={testOpenAI} className="bm-btn-secondary" style={{ padding: "8px 14px", fontSize: 12 }}>
                연결 테스트
              </button>
            </div>
            <ResultLine r={openaiResult} />
          </div>
        </details>
      </section>

      {/* === 2) Google 연결 === */}
      <section className="bm-card mb-5 p-6">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="bm-hero text-[18px] text-[var(--foreground)]">2) Google 연결 (Gmail 자동 답장에 필요)</h2>
          {status && (
            <StatusPill
              ok={status.google.clientIdConfigured && status.google.clientSecretConfigured}
              ifTrue="저장됨"
              ifFalse="비어있음"
            />
          )}
        </div>
        <p className="mb-4 text-[13px] leading-relaxed text-[var(--foreground-soft)]">
          Gmail 받은편지함을 읽고 임시보관함에 답장 초안을 만들려면 Google에게 본인 명의의 OAuth 앱이 한 번 필요. 약 15분 클릭 작업.
          <br />
          <a
            href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SETUP_GMAIL_AUTOMATION.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline"
          >
            클릭 가이드 (Google Cloud Console 등록 7단계) ↗
          </a>
        </p>
        {status?.google.clientIdConfigured && (
          <p className="mb-3 text-[11px] text-[var(--foreground-muted)]">
            현재 저장됨 — Client ID: <code>{status.google.clientIdMasked}</code> · Secret:{" "}
            {status.google.clientSecretConfigured ? "✓ 있음" : "✗ 비어있음"}
          </p>
        )}

        <label className="mb-1.5 mt-2 block text-[12px] font-semibold text-[var(--foreground)]">
          Google Client ID
        </label>
        <input
          type="text"
          value={gClientId}
          onChange={(e) => setGClientId(e.target.value)}
          placeholder="123456-abc.apps.googleusercontent.com"
          className="w-full rounded-[12px] border border-[var(--border)] bg-white px-3 py-2.5 text-[14px]"
        />

        <label className="mb-1.5 mt-3 block text-[12px] font-semibold text-[var(--foreground)]">
          Google Client Secret
        </label>
        <input
          type="password"
          value={gClientSecret}
          onChange={(e) => setGClientSecret(e.target.value)}
          placeholder="GOCSPX-..."
          className="w-full rounded-[12px] border border-[var(--border)] bg-white px-3 py-2.5 text-[14px]"
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
            className="bm-btn-primary"
            style={{ padding: "10px 18px", fontSize: 13 }}
          >
            저장
          </button>
          <a href="/api/gmail/auth" className="bm-btn-hot" style={{ padding: "10px 18px", fontSize: 13 }}>
            📨 Gmail 연결하기 →
          </a>
        </div>
        <ResultLine r={googleResult} />
      </section>

      {/* === 고급 === */}
      <section className="bm-card-soft mb-5 p-4">
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex w-full items-center justify-between text-left text-[13px] text-[var(--foreground-soft)] hover:text-[var(--foreground)]"
        >
          <span>🔧 고급 (이메일 SMTP / 카카오톡 — 자동 답장에는 필요 없음)</span>
          <span className="text-[11px]">{showAdvanced ? "접기 ▲" : "펼치기 ▼"}</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-3 text-[12px] text-[var(--foreground-soft)]">
            <p>
              이 두 가지는 <b>자동 답장 에이전트와는 무관</b>. 부가 기능 (수동 답장 자판기 등) 사용 시
              결과를 본인 이메일/카카오톡으로 받고 싶을 때만.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                이메일 (SMTP):{" "}
                <StatusPill ok={status?.smtp.configured ?? false} ifTrue="저장됨" ifFalse="비어있음" /> · 서버{" "}
                <code>.env.local</code> 에서 직접 편집
              </li>
              <li>
                카카오톡 나에게 보내기:{" "}
                <StatusPill ok={status?.kakao.configured ?? false} ifTrue="저장됨" ifFalse="비어있음" /> · 서버{" "}
                <code>.env.local</code>
              </li>
            </ul>
          </div>
        )}
      </section>

      {loadingStatus && (
        <p className="text-[12px] text-[var(--foreground-muted)]">현재 설정 불러오는 중…</p>
      )}

      <p className="mt-8 text-[11px] text-[var(--foreground-muted)]">
        ※ 입력한 값은 외부로 전송되지 않고, 이 서버의 <code>.hiailab/</code> 폴더(권한 600)에 AES-256-GCM 암호화되어 저장됩니다.
      </p>

      <p className="mt-2 flex flex-wrap gap-3 text-[11px] text-[var(--foreground-muted)]">
        <Link href="https://github.com/sungpyo9053/hiailab/blob/main/docs/KEYS.md" className="underline">키가 뭐고 왜 필요한가요?</Link>
        <Link href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SETUP_GMAIL_AUTOMATION.md" className="underline">Google OAuth 7단계</Link>
      </p>
    </>
  );
}
