"use client";

// Security 섹션 — 정적 + 신뢰감 (애니메이션 최소)
const PILLARS = [
  {
    emoji: "🔑",
    title: "본인 API 키 직접 설정",
    desc: "OpenAI, Gemini, Groq 키를 본인이 입력. AES-256-GCM으로 암호화 저장.",
    detail: "lib/crypto.ts · APP_ENCRYPTION_KEY",
  },
  {
    emoji: "🏠",
    title: "개인 서버 실행 가능",
    desc: "Lightsail / Docker / 본인 서버에 직접 설치. 코드는 GitHub MIT 라이선스.",
    detail: "docker run hiailab/server",
  },
  {
    emoji: "💾",
    title: "민감 데이터는 사용자 환경에",
    desc: "메일 본문은 분류·답장 직후 즉시 폐기. 본인 디렉토리에 메타데이터만.",
    detail: ".hiailab/users/<email>/",
  },
  {
    emoji: "📜",
    title: "실행 로그 + 권한 범위 확인",
    desc: "처리한 메일 ID, 분류 결과, 답장 생성 시각을 로그로. OAuth scope도 투명.",
    detail: "gmail.readonly + gmail.compose only",
  },
];

export default function SecuritySection() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="bm-chip-success">Security</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            메일은 민감합니다.<br />
            <span className="bm-grad-text">그래서 더 보수적으로</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-[var(--foreground-soft)] sm:text-[16px]">
            오픈소스로 코드 전체 공개. 본인이 통제할 수 있는 구조로 설계했습니다.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <div key={i} className="bm-card p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[24px]">
                  {p.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-[var(--foreground)]">{p.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--foreground-soft)]">{p.desc}</p>
                  <div className="mt-3 inline-block rounded-md border border-[var(--border-soft)] bg-[var(--background-soft)] px-2.5 py-1 mono text-[11px] text-[#a5b4fc]">
                    {p.detail}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 약속 stripe */}
        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--background-elev)] p-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { v: "0", l: "자동 발송" },
              { v: "0", l: "외부 데이터 전송" },
              { v: "MIT", l: "오픈소스 라이선스" },
              { v: "256", l: "AES-bit 암호화" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="bm-grad-text bm-hand text-[32px]">{s.v}</div>
                <div className="mt-1 text-[11px] text-[var(--foreground-muted)]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
