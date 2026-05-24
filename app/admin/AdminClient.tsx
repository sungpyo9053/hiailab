"use client";

import { useEffect, useState } from "react";

type UserStat = {
  id: string;
  email: string | null;
  gmailConnected: boolean;
  enabledAgents: string[];
  autoPollingEnabled: boolean;
  lastRunAt: string | null;
  lastRunSummary: string | null;
  processedCount: number;
  recentDraftsCreated: number;
};

type Data = { totalUsers: number; users: UserStat[] };

export default function AdminClient() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      const r = await fetch("/api/admin/users");
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error ?? "권한 없음");
        return;
      }
      setData(d);
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, []);

  if (err) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-sm text-red-200">
        ⚠ {err}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/40">
        불러오는 중…
      </div>
    );
  }

  const totalEnabled = data.users.filter((u) => u.autoPollingEnabled).length;
  const totalProcessed = data.users.reduce((s, u) => s + u.processedCount, 0);
  const totalDrafts = data.users.reduce((s, u) => s + u.recentDraftsCreated, 0);

  return (
    <>
      {/* 요약 카드 */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="가입 사용자" value={`${data.totalUsers}명`} />
        <Stat label="자동 답장 ON" value={`${totalEnabled}명`} />
        <Stat label="누적 처리 메일" value={`${totalProcessed}건`} />
        <Stat label="최근 초안 생성" value={`${totalDrafts}건`} />
      </section>

      {/* 사용자 표 */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-base font-semibold">사용자 목록</h2>
        {data.users.length === 0 ? (
          <p className="text-xs text-white/40">아직 가입한 사용자가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/40">
                  <th className="py-2 pr-3">이메일</th>
                  <th className="py-2 pr-3">Gmail</th>
                  <th className="py-2 pr-3">활성 에이전트</th>
                  <th className="py-2 pr-3">자동 폴링</th>
                  <th className="py-2 pr-3">처리</th>
                  <th className="py-2 pr-3">최근 실행</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 text-xs">
                    <td className="py-2 pr-3 text-white/90">
                      {u.email || u.id}
                    </td>
                    <td className="py-2 pr-3">
                      {u.gmailConnected ? (
                        <span className="text-emerald-400">연결</span>
                      ) : (
                        <span className="text-white/40">미연결</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-white/70">
                      {u.enabledAgents.length > 0 ? u.enabledAgents.join(", ") : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {u.autoPollingEnabled ? (
                        <span className="text-emerald-400">ON</span>
                      ) : (
                        <span className="text-white/40">OFF</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-white/70">
                      {u.processedCount}건 / 초안 {u.recentDraftsCreated}
                    </td>
                    <td className="py-2 pr-3 text-white/50">
                      {u.lastRunAt
                        ? new Date(u.lastRunAt).toLocaleString("ko-KR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white/90">{value}</div>
    </div>
  );
}
