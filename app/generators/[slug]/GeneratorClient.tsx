"use client";

// 주의: 이 파일은 클라이언트로 번들된다.
// lib/prompts.ts (server-only) 를 절대 import 하지 말 것.
// lib/generators.ts 의 메타데이터만 사용한다.

import { useEffect, useState } from "react";

type Props = {
  generatorId: string;
  generatorName: string;
  inputLabel: string;
  placeholder: string;
};

type Mode = "real" | "mock";

type ServerConfig = {
  aiMode: Mode;
  emailMode: Mode;
  kakaoMode: Mode;
};

type SendStatus =
  | { kind: "idle" }
  | { kind: "loading"; channel: "email" | "kakao" }
  | { kind: "success"; channel: "email" | "kakao"; mode: Mode; message: string }
  | { kind: "error"; channel: "email" | "kakao"; message: string };

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

export default function GeneratorClient({
  generatorId,
  generatorName,
  inputLabel,
  placeholder,
}: Props) {
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    text: string;
    generatedAt: string;
    mode: Mode;
  } | null>(null);

  const [emailTo, setEmailTo] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const [sendStatus, setSendStatus] = useState<SendStatus>({ kind: "idle" });

  const [config, setConfig] = useState<ServerConfig | null>(null);
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c: ServerConfig) => setConfig(c))
      .catch(() => setConfig(null));
  }, []);

  async function handleGenerate() {
    if (!input.trim() || generating) return;
    setGenerating(true);
    setGenError(null);
    setResult(null);
    setSendStatus({ kind: "idle" });
    setShowEmailInput(false);
    setCopied(false);
    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generatorId, input }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error ?? "생성 실패");
      }
      setResult({
        text: data.result,
        generatedAt: new Date().toISOString(),
        mode: (data.mode as Mode) ?? "real",
      });
    } catch (err) {
      setGenError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  function buildEmailBody(): string {
    if (!result) return "";
    const ts = new Date(result.generatedAt).toLocaleString("ko-KR");
    return [
      `생성기: ${generatorName}`,
      `생성 시간: ${ts}`,
      "",
      "----- AI 결과 -----",
      result.text,
      "-------------------",
      "",
      "HiaiLab에서 발송됨",
    ].join("\n");
  }

  function buildKakaoBody(): string {
    if (!result) return "";
    return `[${generatorName}]\n\n${result.text}`;
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  async function handleSendEmail() {
    if (!result) return;
    setSendStatus({ kind: "loading", channel: "email" });
    try {
      const resp = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo.trim() || undefined,
          subject: `[HiaiLab] ${generatorName} 결과`,
          content: buildEmailBody(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error ?? "이메일 전송 실패");
      }
      setSendStatus({
        kind: "success",
        channel: "email",
        mode: (data.mode as Mode) ?? "real",
        message: data.message ?? "이메일로 전송 완료",
      });
    } catch (err) {
      setSendStatus({
        kind: "error",
        channel: "email",
        message: (err as Error).message,
      });
    }
  }

  async function handleSendKakao() {
    if (!result) return;
    setSendStatus({ kind: "loading", channel: "kakao" });
    try {
      const resp = await fetch("/api/send-kakao-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "[HiaiLab] AI 결과 도착",
          content: buildKakaoBody(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error ?? "카카오 전송 실패");
      }
      setSendStatus({
        kind: "success",
        channel: "kakao",
        mode: (data.mode as Mode) ?? "real",
        message: data.message ?? "카카오톡으로 전송 완료",
      });
    } catch (err) {
      setSendStatus({
        kind: "error",
        channel: "kakao",
        message: (err as Error).message,
      });
    }
  }

  return (
    <>
      {/* 현재 동작 모드 배지 */}
      {config && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <ModeBadge label="AI" mode={config.aiMode} />
          <ModeBadge label="이메일" mode={config.emailMode} />
          <ModeBadge label="카카오" mode={config.kakaoMode} />
        </div>
      )}

      <section className="mb-6">
        <label className="mb-2 block text-sm font-medium text-white/80">
          {inputLabel}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={9}
          className="w-full resize-y rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || generating}
            className="rounded-xl bg-[var(--accent)] px-5 py-2.5 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generating ? "AI가 작성 중…" : "✉️ AI에게 부탁하기"}
          </button>
        </div>
        {genError && <p className="mt-3 text-sm text-red-400">⚠ {genError}</p>}
      </section>

      {result && (
        <section className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">결과</h2>
            <div className="flex items-center gap-2">
              {result.mode === "mock" && (
                <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">
                  MOCK
                </span>
              )}
              <button
                onClick={handleCopy}
                className="rounded-md border border-white/15 px-2 py-1 text-xs hover:bg-white/10"
              >
                {copied ? "복사됨" : "결과 복사"}
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90">
            {result.text}
          </pre>

          <div className="mt-5 border-t border-white/10 pt-5">
            <div className="mb-3 text-sm font-medium text-white/80">
              결과 보내기
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setShowEmailInput((v) => !v);
                  setSendStatus({ kind: "idle" });
                }}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
              >
                ✉️ 내 이메일로 보내기
              </button>

              <button
                onClick={handleSendKakao}
                disabled={sendStatus.kind === "loading"}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
              >
                💬 카카오톡 나에게 보내기
              </button>
            </div>

            {showEmailInput && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder={
                    config?.emailMode === "mock"
                      ? "(MOCK 모드 — 아무 값이나 입력해도 실제 전송되지 않습니다)"
                      : "받을 이메일 주소 (비워두면 DEFAULT_TO_EMAIL로 발송)"
                  }
                  className="flex-1 min-w-[240px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={sendStatus.kind === "loading"}
                  className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black hover:bg-white disabled:opacity-50"
                >
                  {sendStatus.kind === "loading" && sendStatus.channel === "email"
                    ? "전송 중…"
                    : "보내기"}
                </button>
              </div>
            )}

            {sendStatus.kind === "loading" && (
              <p className="mt-3 text-sm text-white/70">
                {sendStatus.channel === "email"
                  ? "이메일 전송 중…"
                  : "카카오톡 전송 중…"}
              </p>
            )}
            {sendStatus.kind === "success" && (
              <p
                className={
                  "mt-3 text-sm " +
                  (sendStatus.mode === "mock"
                    ? "text-yellow-300"
                    : "text-emerald-400")
                }
              >
                ✓ {sendStatus.message}
              </p>
            )}
            {sendStatus.kind === "error" && (
              <p className="mt-3 text-sm text-red-400">⚠ {sendStatus.message}</p>
            )}
          </div>
        </section>
      )}
    </>
  );
}
