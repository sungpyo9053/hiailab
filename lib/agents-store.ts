import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

// 에이전트 활성화 상태 저장소.
// 형식: .hiailab/agents.json
// {
//   "version": 1,
//   "activations": {
//     "email-reply": { "enabled": true, "activatedAt": "2026-..." }
//   }
// }

const STORE_DIR = path.join(process.cwd(), ".hiailab");
const STORE_FILE = path.join(STORE_DIR, "agents.json");

type ActivationEntry = {
  enabled: boolean;
  activatedAt: string; // ISO
};

type StoreFile = {
  version: 1;
  activations: Record<string, ActivationEntry>;
};

async function readRaw(): Promise<StoreFile> {
  try {
    const buf = await fs.readFile(STORE_FILE, "utf8");
    const data = JSON.parse(buf) as StoreFile;
    if (data.version === 1 && typeof data.activations === "object") return data;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw err;
  }
  return { version: 1, activations: {} };
}

async function writeRaw(data: StoreFile): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
}

export async function isAgentEnabled(agentId: string): Promise<boolean> {
  const data = await readRaw();
  return Boolean(data.activations[agentId]?.enabled);
}

export async function getAgentActivation(agentId: string): Promise<ActivationEntry | null> {
  const data = await readRaw();
  return data.activations[agentId] ?? null;
}

export async function setAgentEnabledState(
  agentId: string,
  enabled: boolean
): Promise<ActivationEntry> {
  const data = await readRaw();
  const existing = data.activations[agentId];
  const next: ActivationEntry = {
    enabled,
    activatedAt: existing?.activatedAt ?? new Date().toISOString(),
  };
  if (!existing) next.activatedAt = new Date().toISOString();
  data.activations[agentId] = next;
  await writeRaw(data);
  return next;
}

export async function getAllActivations(): Promise<Record<string, ActivationEntry>> {
  const data = await readRaw();
  return data.activations;
}
