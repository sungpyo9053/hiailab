"use client";

const POLICIES = [
  {
    label: "데이터 처리 위치",
    body: "API 키와 개인 데이터는 사용자의 실행 환경에서 처리됩니다.",
    detail: "외부 서버로 전송되지 않으며, 셀프호스팅 시 본인 인프라에 보관됩니다.",
  },
  {
    label: "권한 정책",
    body: "각 에이전트는 필요한 권한만 연결하며, 실행 결과는 사용자가 확인한 뒤 적용할 수 있습니다.",
    detail: "최소 권한 원칙. 사용 중인 OAuth scope는 대시보드에서 투명하게 공개됩니다.",
  },
  {
    label: "발송 정책",
    body: "자동 생성된 결과는 즉시 적용되지 않습니다. 메일은 임시보관함, 일정은 tentative, 문서는 draft 형태로 저장됩니다.",
    detail: "사용자가 명시적으로 [적용]하기 전에는 외부에 어떤 변경도 일어나지 않습니다.",
  },
  {
    label: "저장 정책",
    body: "원본 데이터(메일 본문, 문서 내용)는 처리 직후 즉시 폐기됩니다. 메타데이터(ID, 카테고리, 실행 시각)만 사용자 환경에 기록됩니다.",
    detail: "API 키는 AES-256-GCM으로 암호화됩니다. 키 파생은 APP_ENCRYPTION_KEY 기반.",
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="relative bg-[var(--background-soft)] py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <span className="bm-chip-accent">Security &amp; Privacy</span>
          <h2 className="bm-hand mt-4 text-[36px] text-[var(--foreground)] sm:text-[52px]">
            데이터 처리 정책
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-[var(--foreground-soft)] sm:text-[16px]">
            오픈소스로 코드 전체가 공개됩니다. 모든 처리는 사용자가 통제할 수 있는 범위 내에서 일어납니다.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {POLICIES.map((p, i) => (
            <div key={i} className="bg-[var(--background-elev)] p-7">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                {p.label}
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--foreground)]">{p.body}</p>
              <p className="mt-3 text-[12px] leading-relaxed text-[var(--foreground-muted)]">
                {p.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background-elev)] px-6 py-4 text-[12px]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[var(--foreground-soft)]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              MIT License
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              Manual apply
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              AES-256-GCM
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              Self-hostable
            </span>
          </div>
          <a
            href="https://github.com/sungpyo9053/hiailab/blob/main/docs/SECURITY.md"
            target="_blank"
            className="text-[var(--accent)] hover:underline"
          >
            보안 정책 전문 →
          </a>
        </div>
      </div>
    </section>
  );
}
