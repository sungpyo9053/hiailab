import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { runAgentOnce } from "./agent";
import { listAllUserIds } from "./user-paths";
import { isSaaS } from "./mode";
import { ensureUserStoreDir, getUserStoreDir } from "./user-paths";

// 사용자별 agent state.

export type AgentState = {
  enabled: boolean;
  intervalSec: number;
  lastRunAt: string | null;
  lastRunSummary: string | null;
  lastError: string | null;
};

const DEFAULT_STATE: AgentState = {
  enabled: false,
  intervalSec: Number(process.env.AGENT_POLL_INTERVAL_SEC || 300),
  lastRunAt: null,
  lastRunSummary: null,
  lastError: null,
};

function statePath(userId: string): string {
  return path.join(getUserStoreDir(userId), "agent-state.json");
}

async function readState(userId: string): Promise<AgentState> {
  try {
    const buf = await fs.readFile(statePath(userId), "utf8");
    return { ...DEFAULT_STATE, ...(JSON.parse(buf) as AgentState) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

async function writeState(userId: string, s: AgentState): Promise<void> {
  await ensureUserStoreDir(userId);
  await fs.writeFile(statePath(userId), JSON.stringify(s, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
}

export async function getAgentState(userId: string): Promise<AgentState> {
  return readState(userId);
}

export async function setAgentEnabled(userId: string, enabled: boolean): Promise<AgentState> {
  const s = await readState(userId);
  s.enabled = enabled;
  await writeState(userId, s);
  ensureLoopRunning();
  return s;
}

export async function setAgentIntervalSec(userId: string, sec: number): Promise<AgentState> {
  const s = await readState(userId);
  s.intervalSec = Math.max(60, Math.floor(sec));
  await writeState(userId, s);
  return s;
}

export async function triggerAgentRun(userId: string): Promise<void> {
  const s = await readState(userId);
  try {
    const r = await runAgentOnce(userId);
    s.lastRunAt = new Date().toISOString();
    s.lastError = r.ok ? null : r.error ?? "알 수 없는 오류";
    s.lastRunSummary = r.ok
      ? `${r.scanned}건 확인 · 초안 ${r.draftsCreated}건 · 분류 ${JSON.stringify(r.classified)}`
      : r.error ?? "실패";
  } catch (err) {
    s.lastRunAt = new Date().toISOString();
    s.lastError = (err as Error).message;
    s.lastRunSummary = "예외 발생";
  }
  await writeState(userId, s);
}

// === 백그라운드 폴링 ===
declare global {
  // eslint-disable-next-line no-var
  var __hiailabAgentTimer: NodeJS.Timeout | undefined;
  // eslint-disable-next-line no-var
  var __hiailabAgentBusy: boolean | undefined;
}

let bootstrapped = false;

export function ensureLoopRunning(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  if (global.__hiailabAgentTimer) {
    clearInterval(global.__hiailabAgentTimer);
  }

  global.__hiailabAgentTimer = setInterval(async () => {
    if (global.__hiailabAgentBusy) return;
    global.__hiailabAgentBusy = true;
    try {
      const users = isSaaS() ? await listAllUserIds() : ["_self"];
      for (const userId of users) {
        const s = await readState(userId);
        if (!s.enabled) continue;
        try {
          await triggerAgentRun(userId);
        } catch (err) {
          console.error("[agent-loop] user run 실패", { userId, message: (err as Error).message });
        }
      }
    } finally {
      global.__hiailabAgentBusy = false;
    }
  }, 30_000);
}
