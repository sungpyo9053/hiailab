import { NextResponse } from "next/server";
import { HttpError, requireAdmin } from "@/lib/current-user";
import { getAllActivations } from "@/lib/agents-store";
import { getConnectedEmail, isGmailConnected } from "@/lib/gmail";
import { listAllUserIds } from "@/lib/user-paths";
import { getAgentState } from "@/lib/agent-loop";
import { getProcessedCount, getRecentProcessed } from "@/lib/processed-store";

export const runtime = "nodejs";

// 어드민 전용 — 모든 사용자 + 각자 처리 통계.
export async function GET() {
  try {
    await requireAdmin();
    const userIds = await listAllUserIds();

    const items = await Promise.all(
      userIds.map(async (id) => {
        const [conn, email, activations, state, processedCount, recent] = await Promise.all([
          isGmailConnected(id),
          getConnectedEmail(id),
          getAllActivations(id),
          getAgentState(id),
          getProcessedCount(id),
          getRecentProcessed(id, 5),
        ]);
        const enabledAgents = Object.entries(activations)
          .filter(([, v]) => v.enabled)
          .map(([k]) => k);
        const draftsCreated = recent.filter((e) => e.draftId).length;
        return {
          id,
          email,
          gmailConnected: conn,
          enabledAgents,
          autoPollingEnabled: state.enabled,
          lastRunAt: state.lastRunAt,
          lastRunSummary: state.lastRunSummary,
          processedCount,
          recentDraftsCreated: draftsCreated,
        };
      })
    );

    return NextResponse.json({
      totalUsers: items.length,
      users: items,
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
