"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background-soft)] py-14">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 text-[16px] font-extrabold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "var(--gradient-hero)" }}>
                <span className="text-white text-[12px] font-black">H</span>
              </span>
              <span>HI AI LAB</span>
            </div>
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-[var(--foreground-muted)]">
              메일 자동화는 코드가 아니라 규칙으로.
              <br />본인 계정 안에서 동작하는 오픈소스 AI 에이전트.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="https://github.com/sungpyo9053/hiailab"
                target="_blank"
                className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background-elev)] px-3 py-1.5 text-[11px] font-semibold text-[var(--foreground-soft)] hover:border-[var(--border-strong)]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
              </a>
            </div>
          </div>
          <FooterCol
            title="Product"
            items={[
              { l: "Features", h: "#product" },
              { l: "Use cases", h: "#use-cases" },
              { l: "Pricing", h: "#pricing" },
            ]}
          />
          <FooterCol
            title="Developers"
            items={[
              { l: "GitHub", h: "https://github.com/sungpyo9053/hiailab" },
              { l: "Docs", h: "https://github.com/sungpyo9053/hiailab/blob/main/README.md" },
              { l: "Self-host guide", h: "https://github.com/sungpyo9053/hiailab/blob/main/docs/SELF_HOST_VS_SAAS.md" },
              { l: "API keys guide", h: "https://github.com/sungpyo9053/hiailab/blob/main/docs/KEYS.md" },
            ]}
          />
          <FooterCol
            title="Start"
            items={[
              { l: "무료 가입", h: "/signup" },
              { l: "로그인", h: "/login" },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-[11px] text-[var(--foreground-muted)]">
          <div>© 2026 HI AI LAB · MIT License</div>
          <div className="mono">v0.1.0 · powered by Groq Llama 3.3 70B</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { l: string; h: string }[] }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <Link href={it.h} className="text-[12px] text-[var(--foreground-soft)] hover:text-[var(--foreground)]">
              {it.l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
