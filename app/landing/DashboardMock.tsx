"use client";

// 여러 에이전트 카드가 메인인 SaaS 대시보드 mock
const ACTIVE_AGENTS = [
  { cat: "Mail", name: "Reply Draft", status: "running", runs: 247, last: "2m ago", color: "#3b82f6" },
  { cat: "Mail", name: "Inbox Classifier", status: "running", runs: 1842, last: "5m ago", color: "#3b82f6" },
  { cat: "Calendar", name: "Meeting Detector", status: "running", runs: 38, last: "12m ago", color: "#8b5cf6" },
  { cat: "Document", name: "PDF Summarizer", status: "idle", runs: 56, last: "1h ago", color: "#06b6d4" },
  { cat: "Alert", name: "Slack Digest", status: "running", runs: 412, last: "1m ago", color: "#f59e0b" },
  { cat: "Report", name: "Daily Summary", status: "scheduled", runs: 7, last: "scheduled 18:00", color: "#10b981" },
];

export default function DashboardMock() {
  return (
    <div className="bm-mock">
      <div className="bm-mock-header">
        <div className="bm-mock-dot" style={{ background: "#ff5f57" }} />
        <div className="bm-mock-dot" style={{ background: "#febc2e" }} />
        <div className="bm-mock-dot" style={{ background: "#28c840" }} />
        <div className="ml-3 flex items-center gap-2 text-[11px] text-[var(--foreground-muted)]">
          <span className="mono">hiailab.io/agents</span>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-px bg-[var(--border)]">
        {/* 좌측 사이드 */}
        <aside className="col-span-2 hidden bg-[var(--background-soft)] p-3 sm:block">
          <div className="space-y-1">
            {[
              { t: "Agents", a: true },
              { t: "Runs" },
              { t: "Catalog" },
              { t: "Logs" },
              { t: "Settings" },
            ].map((it, i) => (
              <div
                key={i}
                className={
                  "rounded-md px-2 py-1.5 text-[11px] " +
                  (it.a
                    ? "bg-[var(--accent-soft)] text-[#a5b4fc] font-semibold"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground-soft)]")
                }
              >
                {it.t}
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-[var(--border)] pt-3">
            <div className="text-[9px] uppercase tracking-wider text-[var(--foreground-muted)] mb-2">Categories</div>
            {[
              { t: "Mail", c: "#3b82f6" },
              { t: "Calendar", c: "#8b5cf6" },
              { t: "Document", c: "#06b6d4" },
              { t: "Alert", c: "#f59e0b" },
              { t: "Report", c: "#10b981" },
              { t: "Data", c: "#ec4899" },
            ].map((cat, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 text-[10px] text-[var(--foreground-soft)]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.c }} />
                {cat.t}
              </div>
            ))}
          </div>
        </aside>

        {/* 메인 영역 — Active Agents 그리드 */}
        <main className="col-span-12 bg-[#0f1424] p-4 sm:col-span-10 sm:p-5">
          {/* 상단 stat */}
          <div className="mb-4 grid grid-cols-4 gap-2.5">
            {[
              { l: "Active", v: "6" },
              { l: "Total runs", v: "2,602" },
              { l: "Categories", v: "5 / 6" },
              { l: "Auto-applied", v: "0", accent: true },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--background-elev)] px-3 py-2">
                <div className="text-[9px] uppercase tracking-wider text-[var(--foreground-muted)]">{s.l}</div>
                <div className={"mt-0.5 text-[18px] font-bold " + (s.accent ? "text-[#a5b4fc]" : "text-[var(--foreground)]")}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          {/* Active Agents — 카드 그리드 */}
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-[12px] font-semibold text-[var(--foreground)]">Active agents</h3>
            <span className="text-[10px] text-[var(--foreground-muted)] mono">refreshing every 30s</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ACTIVE_AGENTS.map((a, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--border)] bg-[var(--background-elev)] p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider" style={{ color: a.color }}>
                      {a.cat}
                    </div>
                    <div className="mt-0.5 text-[12px] font-semibold text-[var(--foreground)]">{a.name}</div>
                  </div>
                  <span
                    className="mono rounded px-1.5 py-0.5 text-[9px]"
                    style={{
                      background:
                        a.status === "running"
                          ? "rgba(16, 185, 129, 0.15)"
                          : a.status === "scheduled"
                            ? "rgba(99, 102, 241, 0.15)"
                            : "rgba(107, 112, 136, 0.15)",
                      color:
                        a.status === "running"
                          ? "#6ee7b7"
                          : a.status === "scheduled"
                            ? "#a5b4fc"
                            : "#9ca3af",
                    }}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[var(--foreground-muted)] mono">
                  <span>{a.runs.toLocaleString()} runs</span>
                  <span>{a.last}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--background-soft)] px-4 py-2 text-[10px] text-[var(--foreground-muted)] mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            6 agents running
          </span>
          <span>next poll in 4:23</span>
        </div>
        <div>v0.1.0 · self-hosted</div>
      </div>
    </div>
  );
}
