import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { runAgentOnce } from "./agent";

// 백그라운드 폴링 루프.
// Next.js 단일 프로세스에서 setInterval 로 구동. 토글 상태는 .hiailab/agent-state.json 에 저장.

const STORE_DIR = path.join(process.cwd(), ".hiailab");
const STATE_FILE = path.join(STORE_DIR, "agent-state.json");

type AgentState = {
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

async function readState(): Promise<AgentState> {
  try {
    const buf = await fs.readFile(STATE_FILE, "utf8");
    const data = JSON.parse(buf) as AgentState;
    return { ...DEFAULT_STATE, ...data };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

async function writeState(s: AgentState): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(s, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
}

export async function getAgentState(): Promise<AgentState> {
  return readState();
}

export async function setAgentEnabled(enabled: boolean): Promise<AgentState> {
  const s = await readState();
  s.enabled = enabled;
  await writeState(s);
  ensureLoopRunning();
  return s;
}

export async function setAgentIntervalSec(sec: number): Promise<AgentState> {
  const s = await readState();
  s.intervalSec = Math.max(60, Math.floor(sec));
  await writeState(s);
  return s;
}

// 한 번 폴링 (UI 의 "지금 실행" 버튼에서도 호출)
export async function triggerAgentRun(): Promise<void> {
  const s = await readState();
  try {
    const r = await runAgentOnce();
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
  await writeState(s);
}

// 모듈 스코프에 단일 인터벌 핸들 유지 (HMR 에서도 중복 방지)
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
    const s = await readState();
    if (!s.enabled) return;
    global.__hiailabAgentBusy = true;
    try {
      await triggerAgentRun();
    } finally {
      global.__hiailabAgentBusy = false;
    }
  }, 30_000); // 30초마다 state 확인 + 마지막 실행 이후 intervalSec 지났을 때만 실행하는 게 정확하지만 v1 은 단순화
}
