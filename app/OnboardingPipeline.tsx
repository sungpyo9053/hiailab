"use client";

// 메인 페이지 상단 — 셋업 진행 파이프라인.
// 비개발자가 영상 보면서 "지금 어디까지 왔고 다음에 뭘 하면 되는지"를 한눈에 본다.
// 모든 단계 완료 시 작게 접힘. 진행 중 단계는 펼쳐서 액션 버튼 노출.

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
  modes: { ai: Mode; email: Mode; kakao: Mode };
  encryption: { configured: boolean };
  ownerEmail: string | null;
};

type GmailStatus = { connected: boolean; email: string | null };
type AgentState = { enabled: boolean };

type Status = "done" | "current" | "locked" | "external";

type Step = {
  n: number;
  title: string;
  desc: string;
  status: Status;
  detail?: string;
  actions?: { label: string; href: string; external?: boolean; primary?: boolean }[];
};

export default function OnboardingPipeline() {
  const [setup, setSetup] = useState<SetupStatus | null>(null);
  const [gmail, setGmail] = useState<GmailStatus | null>(null);
  const [agent, setAgent] = useState<AgentState | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  async function refresh() {
    try {
      const [s, g, a] = await Promise.all([
        fetch("/api/setup/status").then((r) => r.json()),
        fetch("/api/gmail/status").then((r) => r.json()),
        fetch("/api/agent/status").then((r) => r.json()),
      ]);
      setSetup(s);
      setGmail(g);
      setAgent(a.state);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 10_000);
    return () => clearInterval(t);
  }, []);

  if (!setup || !gmail || !agent) {
    return (
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/40">
        진행 상태를 불러오는 중…
      </div>
    );
  }

  // 단계별 완료 판정
  const step1Done = setup.encryption.configured;
  const step2Done = Boolean(setup.ownerEmail);
  const step3Done = setup.openai.configured;
  const step4Done =
    setup.google.clientIdConfigured && setup.google.clientSecretConfigured;
  const step5Done = gmail.connected;
  const step6Done = agent.enabled;

  const allDone = step1Done && step2Done && step3Done && step4Done && step5Done && step6Done;

  // "현재 단계" — 첫 번째 미완료
  function statusFor(idx: number, done: boolean, prevAllDone: boolean): Status {
    if (done) return "done";
    if (!prevAllDone) return "locked";
    return "current";
  }

  const s1: Status = statusFor(1, step1Done, true);
  const s2: Status = statusFor(2, step2Done, step1Done);
  const s3: Status = statusFor(3, step3Done, step1Done && step2Done);
  const s4: Status = statusFor(4, step4Done, step1Done && step2Done && step3Done);
  const s5: Status = statusFor(5, step5Done, step1Done && step2Done && step3Done && step4Done);
  const s6: Status = statusFor(6, step6Done, step1Done && step2Done && step3Done && step4Done && step5Done);

  const steps: Step[] = [
    {
      n: 1,
      title: "서버 자물쇠 키",
      desc: "키 저장에 쓸 암호화 자물쇠 (자동 생성됨)",
      status: s1,
      detail: step1Done
        ? "✓ 자동으로 준비됐어요. 이 단계는 신경 안 쓰셔도 돼요."
        : "서버의 .env.local 에 APP_ENCRYPTION_KEY 한 줄이 필요해요. (보통 설치 스크립트가 자동으로 처리)",
    },
    {
      n: 2,
      title: "소유자 잠금",
      desc: "내 Gmail만 연결 가능하게 잠그기",
      status: s2,
      detail: step2Done
        ? `✓ ${setup.ownerEmail} 만 연결 가능하게 잠겨 있어요.`
        : "서버의 .env.local 에 OWNER_EMAIL=내@gmail.com 한 줄 추가 후 서버 재시작. (다른 사람이 OAuth로 들어오는 걸 막아요.)",
    },
    {
      n: 3,
      title: "OpenAI 키",
      desc: "AI가 답장 글을 만들 때 사용",
      status: s3,
      detail: step3Done
        ? `✓ 저장됨: ${setup.openai.masked}`
        : "OpenAI에서 sk-... 키를 발급받고 /setup 에 붙여넣으세요. 답장 1건당 ₩1 미만.",
      actions: step3Done
        ? undefined
        : [
            {
              label: "1. OpenAI 키 발급 (새 탭)",
              href: "https://platform.openai.com/api-keys",
              external: true,
            },
            { label: "2. /setup 에 키 붙여넣기", href: "/setup", primary: true },
          ],
    },
    {
      n: 4,
      title: "Google 연결 설정",
      desc: "Gmail 받은편지함을 읽고 임시보관함에 답장 만드는 권한",
      status: s4,
      detail: step4Done
        ? `✓ Google OAuth 앱 등록됨 (Client ID: ${setup.google.clientIdMasked})`
        : "Google Cloud Console에서 OAuth 앱을 한 번만 만들어야 해요 (약 15분). 가이드의 7단계 그대로 따라가면 됩니다.",
      actions: step4Done
        ? undefined
        : [
            {
              label: "1. 가이드 보기 (7단계 / 새 탭)",
              href: "https://github.com/sungpyo9053/hiailab/blob/main/docs/SETUP_GMAIL_AUTOMATION.md",
              external: true,
            },
            {
              label: "2. Google Cloud 콘솔 열기 (새 탭)",
              href: "https://console.cloud.google.com/",
              external: true,
            },
            {
              label: "3. /setup에 Client ID/Secret 붙여넣기",
              href: "/setup",
              primary: true,
            },
          ],
    },
    {
      n: 5,
      title: "Gmail 계정 연결",
      desc: "본인 Gmail로 로그인 → 권한 동의 (한 번만)",
      status: s5,
      detail: step5Done
        ? `✓ ${gmail.email} 연결됨`
        : "위 4번까지 끝나면, 'Gmail 연결하기' 버튼이 활성화돼요. 본인 Gmail로 로그인 후 권한 3개 동의.",
      actions:
        step5Done || s5 === "locked"
          ? undefined
          : [{ label: "Gmail 연결하기", href: "/api/gmail/auth", primary: true }],
    },
    {
      n: 6,
      title: "자동 답장 켜기",
      desc: "5분마다 받은편지함 확인 → 답장 필요한 메일만 임시보관함에 초안",
      status: s6,
      detail: step6Done
        ? "✓ 동작 중. 새 메일이 오면 자동으로 임시보관함에 답장 초안이 생성돼요."
        : "위 5번까지 끝나면, 아래 '자동 답장 켜기' 버튼이 활성화돼요. ON으로 두기만 하면 끝.",
    },
  ];

  // 모두 완료된 경우 — 작게 접힘 가능
  if (allDone && collapsed) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm">
        <span className="text-emerald-300">✓ 셋업 6/6 완료 — 자동 답장 동작 중</span>
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs text-white/40 hover:text-white/70"
        >
          진행 단계 보기
        </button>
      </div>
    );
  }

  const doneCount = [step1Done, step2Done, step3Done, step4Done, step5Done, step6Done].filter(Boolean).length;

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            셋업 진행 상황 ({doneCount}/6 완료)
          </h2>
          <p className="mt-0.5 text-xs text-white/50">
            영상 보면서 한 단계씩 따라하면 됩니다. 어디서 막혔는지 한눈에 보여요.
          </p>
        </div>
        {allDone && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-xs text-white/40 hover:text-white/70"
          >
            접기
          </button>
        )}
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => (
          <StepCard key={step.n} step={step} isLast={idx === steps.length - 1} />
        ))}
      </div>
    </section>
  );
}

function StepCard({ step, isLast }: { step: Step; isLast: boolean }) {
  const isDone = step.status === "done";
  const isCurrent = step.status === "current";
  const isLocked = step.status === "locked";

  return (
    <div className="relative">
      {/* 세로 연결선 */}
      {!isLast && (
        <div
          className={
            "absolute left-[15px] top-8 h-full w-px " +
            (isDone ? "bg-emerald-400/40" : "bg-white/10")
          }
        />
      )}

      <div
        className={
          "relative flex gap-3 rounded-lg p-3 " +
          (isCurrent
            ? "bg-yellow-400/[0.08] ring-1 ring-yellow-400/30"
            : isDone
              ? ""
              : "")
        }
      >
        {/* 단계 번호/체크 원 */}
        <div
          className={
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold " +
            (isDone
              ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-300"
              : isCurrent
                ? "border-yellow-400/60 bg-yellow-400/20 text-yellow-300 animate-pulse"
                : "border-white/15 bg-white/5 text-white/40")
          }
        >
          {isDone ? "✓" : isLocked ? "🔒" : step.n}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <span
              className={
                "text-sm font-semibold " +
                (isDone ? "text-emerald-200" : isCurrent ? "text-white" : "text-white/50")
              }
            >
              {step.title}
            </span>
            <span
              className={
                "text-xs " + (isDone ? "text-white/50" : "text-white/40")
              }
            >
              {step.desc}
            </span>
          </div>

          {/* 진행 중 또는 완료 시 상세 표시. 잠긴 단계는 한 줄만. */}
          {(isCurrent || isDone) && step.detail && (
            <p
              className={
                "mt-1 text-xs leading-relaxed " +
                (isDone ? "text-white/40" : "text-white/75")
              }
            >
              {step.detail}
            </p>
          )}

          {isCurrent && step.actions && step.actions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {step.actions.map((a, i) => {
                const cls = a.primary
                  ? "bg-[var(--accent)] text-black"
                  : "border border-white/20 text-white/80 hover:bg-white/5";
                return a.external ? (
                  <a
                    key={i}
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      "rounded-lg px-3 py-1.5 text-xs font-semibold " + cls
                    }
                  >
                    {a.label} ↗
                  </a>
                ) : (
                  <a
                    key={i}
                    href={a.href}
                    className={
                      "rounded-lg px-3 py-1.5 text-xs font-semibold " + cls
                    }
                  >
                    {a.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
