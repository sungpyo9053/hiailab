"use client";

// 실제 SaaS 대시보드처럼 보이는 mock UI
export default function DashboardMock() {
  return (
    <div className="bm-mock">
      <div className="bm-mock-header">
        <div className="bm-mock-dot" style={{ background: "#ff5f57" }} />
        <div className="bm-mock-dot" style={{ background: "#febc2e" }} />
        <div className="bm-mock-dot" style={{ background: "#28c840" }} />
        <div className="ml-3 flex items-center gap-2 text-[11px] text-[var(--foreground-muted)]">
          <span className="mono">hiailab.io/dashboard</span>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-px bg-[var(--border)]">
        {/* 좌측 사이드 */}
        <aside className="col-span-2 hidden bg-[var(--background-soft)] p-3 sm:block">
          <div className="space-y-1">
            {[
              { e: "📥", t: "Inbox", a: true },
              { e: "🤖", t: "Agents" },
              { e: "📜", t: "Rules" },
              { e: "📊", t: "Logs" },
              { e: "⚙️", t: "Settings" },
            ].map((it, i) => (
              <div
                key={i}
                className={
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] " +
                  (it.a
                    ? "bg-[var(--accent-soft)] text-[#a5b4fc] font-semibold"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground-soft)]")
                }
              >
                <span>{it.e}</span>
                <span>{it.t}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* 메인 영역 */}
        <main className="col-span-12 bg-[#0f1424] p-4 sm:col-span-10 sm:p-6">
          {/* 상단 stat */}
          <div className="mb-5 grid grid-cols-4 gap-3">
            {[
              { l: "Today", v: "47", s: "received", c: "text-[var(--foreground)]" },
              { l: "Classified", v: "47", s: "100%", c: "text-[#6ee7b7]" },
              { l: "Drafts", v: "12", s: "ready", c: "text-[#a5b4fc]" },
              { l: "Sent (auto)", v: "0", s: "always", c: "text-[var(--foreground-muted)]" },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--background-elev)] px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">{s.l}</div>
                <div className={"mt-1 text-[20px] font-bold " + s.c}>{s.v}</div>
                <div className="text-[10px] text-[var(--foreground-muted)]">{s.s}</div>
              </div>
            ))}
          </div>

          {/* 활동 로그 */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[12px] font-semibold text-[var(--foreground)]">Recent activity</h3>
            <span className="bm-chip-success text-[10px]">● running</span>
          </div>
          <div className="space-y-1.5">
            {[
              { t: "09:32:14", e: "classify", from: "김민재 매니저", cat: "needs_reply", color: "var(--success)" },
              { t: "09:32:14", e: "draft", from: "다음 주 회의 일정 협의", cat: "saved", color: "var(--accent)" },
              { t: "09:32:09", e: "classify", from: "GitHub Notifications", cat: "notification", color: "var(--warm)" },
              { t: "09:32:04", e: "classify", from: "AWS Billing", cat: "notification", color: "var(--warm)" },
              { t: "09:32:01", e: "skip", from: "[광고] Black Friday Sale", cat: "promotion", color: "var(--foreground-muted)" },
              { t: "09:31:58", e: "classify", from: "박지수 디자이너", cat: "needs_reply", color: "var(--success)" },
              { t: "09:31:58", e: "draft", from: "시안 피드백 부탁드립니다", cat: "saved", color: "var(--accent)" },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-[var(--background-elev)]/50 px-3 py-2 text-[11px]"
              >
                <span className="col-span-2 mono text-[var(--foreground-muted)]">{row.t}</span>
                <span className="col-span-2 mono" style={{ color: row.color }}>
                  {row.e}
                </span>
                <span className="col-span-5 truncate text-[var(--foreground-soft)]">{row.from}</span>
                <span className="col-span-3 text-right">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] mono"
                    style={{
                      background: `color-mix(in srgb, ${row.color} 15%, transparent)`,
                      color: row.color,
                    }}
                  >
                    {row.cat}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Footer status bar */}
      <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--background-soft)] px-4 py-2 text-[10px] text-[var(--foreground-muted)] mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            connected
          </span>
          <span>next poll in 4:23</span>
        </div>
        <div>v0.1.0 · Groq Llama 3.3 70B</div>
      </div>
    </div>
  );
}
