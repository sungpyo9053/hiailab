"use client";

// 주의: 클라이언트로 번들된다. lib/prompts.ts / lib/server-config.ts 등 서버 전용 모듈을 import 하지 말 것.
// 비밀값 원문은 절대 받지 않고, 마스킹된 status 만 사용한다.

import Link from "next/link";
import { useEffect, useState } from "react";

type Mode = "real" | "mock";

type SetupStatus = {
  openai: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  smtp: {
    configured: boolean;
    hostMasked: string;
    port: number | null;
    userMasked: string;
    hasPass: boolean;
    defaultToMasked: string;
    source: "env" | "stored" | "mixed" | "none";
  };
  kakao: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  modes: { ai: Mode; email: Mode; kakao: Mode };
  encryption: { configured: boolean };
  hasDefaultTo: boolean;
};

type SaveResp = { ok: true; status: SetupStatus } | { ok: false; error: string };
type TestResp =
  | { ok: true; mode: Mode; message: string }
  | { ok: false; mode?: Mode; error: string };

function ModeBadge({ label, mode }: { label: string; mode: Mode | undefined }) {
  if (!mode) return null;
  const real = mode === "real";
  return (
    <span
      className={
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide " +
        (real
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-yellow-400/30 bg-yellow-400/10 text-yellow-300")
      }
    >
      {label} {real ? "REAL" : "MOCK"}
    </span>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        "inline-block h-2.5 w-2.5 rounded-full " +
        (ok ? "bg-emerald-400" : "bg-white/20")
      }
    />
  );
}

export default function SetupClient() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // 입력 필드 (저장된 값은 받지 않으므로 항상 빈 문자열로 시작)
  const [openaiKey, setOpenaiKey] = useState("");
  const [smtp, setSmtp] = useState({
    SMTP_HOST: "",
    SMTP_PORT: "",
    SMTP_USER: "",
    SMTP_PASS: "",
    DEFAULT_TO_EMAIL: "",
  });
  const [kakaoToken, setKakaoToken] = useState("");

  type ResultState = {
    kind: "loading" | "success" | "error";
    text: string;
    mock?: boolean;
  };
  const [openaiResult, setOpenaiResult] = useState<ResultState | null>(null);
  const [smtpResult, setSmtpResult] = useState<ResultState | null>(null);
  const [kakaoResult, setKakaoResult] = useState<ResultState | null>(null);

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

  async function runTest(path: string, sectionResult: (r: ResultState) => void) {
    sectionResult({ kind: "loading", text: "테스트 중…" });
    try {
      const r = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await r.json()) as TestResp;
      if (!r.ok || !data.ok) {
        const err = (data as { error?: string }).error ?? "테스트 실패";
        sectionResult({ kind: "error", text: `✗ ${err}` });
        return;
      }
      sectionResult({
        kind: "success",
        text: `✓ ${data.message}`,
        mock: data.mode === "mock",
      });
    } catch (e) {
      sectionResult({ kind: "error", text: `✗ ${(e as Error).message}` });
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

  // === 렌더링 ===

  return (
    <>
      {/* 상단: 실행 모드 + 암호화 상태 */}
      <section className="mb-6 flex flex-wrap items-center gap-3">
        {status && (
          <>
            <ModeBadge label="AI" mode={status.modes.ai} />
            <ModeBadge label="이메일" mode={status.modes.email} />
            <ModeBadge label="카카오" mode={status.modes.kakao} />
          </>
        )}
      </section>

      {/* APP_ENCRYPTION_KEY 경고 */}
      {status && !status.encryption.configured && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          <div className="font-semibold">⚠ APP_ENCRYPTION_KEY가 없습니다</div>
          <p className="mt-1">
            현재 설정값을 안전하게 저장할 수 없습니다. <code>.env.local</code>{" "}
            파일에 다음 줄을 추가하고 <b>dev 서버를 재시작</b>한 뒤 다시 이
            페이지로 오세요.
          </p>
          <pre className="mt-2 rounded-md bg-black/40 p-2 text-xs">
            APP_ENCRYPTION_KEY=&lt;32바이트 이상 랜덤 문자열&gt;
          </pre>
          <p className="mt-1 text-xs text-red-300/80">
            예시 생성: macOS/Linux 터미널에서{" "}
            <code>openssl rand -base64 32</code>
          </p>
        </div>
      )}

      {/* OpenAI */}
      <SectionCard
        title="1) OpenAI 설정"
        helpHref="/docs/openai"
        status={status?.openai.configured ? "ok" : "empty"}
        mode={status?.modes.ai}
        savedLine={
          status?.openai.configured
            ? `저장됨: ${status.openai.masked} (${status.openai.source})`
            : "아직 설정되지 않음 — 비워두면 MOCK으로 동작합니다."
        }
      >
        <label className="mb-1 block text-xs text-white/60">OPENAI_API_KEY</label>
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
              void save({ OPENAI_API_KEY: openaiKey }, setOpenaiResult).then(
                () => setOpenaiKey("")
              );
            }}
            disabled={!openaiKey.trim() || !status?.encryption.configured}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            저장
          </button>
          <button
            onClick={() => void runTest("/api/setup/test-openai", setOpenaiResult)}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            연결 테스트
          </button>
        </div>
        <ResultLine r={openaiResult} />
      </SectionCard>

      {/* SMTP */}
      <SectionCard
        title="2) SMTP 이메일 설정"
        helpHref="/docs/gmail"
        status={status?.smtp.configured ? "ok" : "empty"}
        mode={status?.modes.email}
        savedLine={
          status?.smtp.configured
            ? `저장됨: ${status.smtp.userMasked} / 호스트 ${status.smtp.hostMasked}:${status.smtp.port ?? "?"} (${status.smtp.source})`
            : "아직 설정되지 않음 — 비워두면 MOCK으로 동작합니다."
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="SMTP_HOST"
            placeholder="smtp.gmail.com"
            value={smtp.SMTP_HOST}
            onChange={(v) => setSmtp({ ...smtp, SMTP_HOST: v })}
          />
          <Field
            label="SMTP_PORT"
            placeholder="587"
            value={smtp.SMTP_PORT}
            onChange={(v) => setSmtp({ ...smtp, SMTP_PORT: v })}
          />
          <Field
            label="SMTP_USER"
            placeholder="your@gmail.com"
            value={smtp.SMTP_USER}
            onChange={(v) => setSmtp({ ...smtp, SMTP_USER: v })}
          />
          <Field
            label="SMTP_PASS (Gmail 앱 비밀번호)"
            placeholder="xxxx xxxx xxxx xxxx"
            type="password"
            value={smtp.SMTP_PASS}
            onChange={(v) => setSmtp({ ...smtp, SMTP_PASS: v })}
          />
          <Field
            label="DEFAULT_TO_EMAIL"
            placeholder="받을 기본 이메일 (선택)"
            value={smtp.DEFAULT_TO_EMAIL}
            onChange={(v) => setSmtp({ ...smtp, DEFAULT_TO_EMAIL: v })}
            wide
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (!status?.encryption.configured) return;
              const updates: Record<string, string> = {};
              for (const [k, v] of Object.entries(smtp)) {
                if (v.trim()) updates[k] = v.trim();
              }
              if (Object.keys(updates).length === 0) return;
              void save(updates, setSmtpResult).then(() =>
                setSmtp({
                  SMTP_HOST: "",
                  SMTP_PORT: "",
                  SMTP_USER: "",
                  SMTP_PASS: "",
                  DEFAULT_TO_EMAIL: "",
                })
              );
            }}
            disabled={!status?.encryption.configured}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            저장
          </button>
          <button
            onClick={() => void runTest("/api/setup/test-smtp", setSmtpResult)}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            연결 테스트 (메일 1통 발송)
          </button>
        </div>
        <ResultLine r={smtpResult} />
      </SectionCard>

      {/* Kakao */}
      <SectionCard
        title="3) 카카오톡 나에게 보내기 설정"
        helpHref="/docs/kakao"
        status={status?.kakao.configured ? "ok" : "empty"}
        mode={status?.modes.kakao}
        savedLine={
          status?.kakao.configured
            ? `저장됨: ${status.kakao.masked} (${status.kakao.source})`
            : "아직 설정되지 않음 — 비워두면 MOCK으로 동작합니다."
        }
      >
        <label className="mb-1 block text-xs text-white/60">
          KAKAO_ACCESS_TOKEN (talk_message scope 필요, 수동 발급)
        </label>
        <input
          type="password"
          value={kakaoToken}
          onChange={(e) => setKakaoToken(e.target.value)}
          placeholder="액세스 토큰을 붙여넣으세요"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (!kakaoToken.trim() || !status?.encryption.configured) return;
              void save({ KAKAO_ACCESS_TOKEN: kakaoToken }, setKakaoResult).then(
                () => setKakaoToken("")
              );
            }}
            disabled={!kakaoToken.trim() || !status?.encryption.configured}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            저장
          </button>
          <button
            onClick={() => void runTest("/api/setup/test-kakao", setKakaoResult)}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            연결 테스트 (메시지 1건 발송)
          </button>
        </div>
        <ResultLine r={kakaoResult} />
      </SectionCard>

      {loadingStatus && (
        <p className="text-xs text-white/40">현재 설정을 불러오는 중…</p>
      )}

      <p className="mt-8 text-xs text-white/40">
        ※ 입력한 값은 외부로 전송되지 않으며, 이 서버의 <code>.autovending/</code>{" "}
        폴더(권한 600)에 AES-256-GCM 암호화되어 저장됩니다. 이 폴더는 Git에
        커밋되지 않습니다.
      </p>

      <p className="mt-2 text-xs text-white/40">
        도움말 문서: <Link href="/docs/openai" className="underline">OpenAI</Link>{" "}
        · <Link href="/docs/gmail" className="underline">Gmail/SMTP</Link> ·{" "}
        <Link href="/docs/kakao" className="underline">카카오</Link>
      </p>
    </>
  );
}

function SectionCard({
  title,
  status,
  mode,
  savedLine,
  helpHref,
  children,
}: {
  title: string;
  status: "ok" | "empty" | "warn";
  mode?: Mode;
  savedLine: string;
  helpHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <StatusDot ok={status === "ok"} />
        <h2 className="text-base font-semibold">{title}</h2>
        <ModeBadge label="" mode={mode} />
        {helpHref && (
          <Link
            href={helpHref}
            className="ml-auto text-xs text-white/40 underline hover:text-white"
          >
            도움말
          </Link>
        )}
      </div>
      <p className="mb-3 text-xs text-white/50">{savedLine}</p>
      {children}
    </section>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  wide,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "password";
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-xs text-white/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
      />
    </div>
  );
}
