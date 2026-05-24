import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ensureUserStoreDir, getUserStoreDir } from "./user-paths";

// 사용자별 에이전트 활성화 상태.

type ActivationEntry = {
  enabled: boolean;
  activatedAt: string;
};

type StoreFile = {
  version: 1;
  activations: Record<string, ActivationEntry>;
};

function filePath(userId: string): string {
  return path.join(getUserStoreDir(userId), "agents.json");
}

async function readRaw(userId: string): Promise<StoreFile> {
  try {
    const buf = await fs.readFile(filePath(userId), "utf8");
    const data = JSON.parse(buf) as StoreFile;
    if (data.version === 1 && typeof data.activations === "object") return data;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  return { version: 1, activations: {} };
}

async function writeRaw(userId: string, data: StoreFile): Promise<void> {
  await ensureUserStoreDir(userId);
  await fs.writeFile(filePath(userId), JSON.stringify(data, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
}

export async function isAgentEnabled(userId: string, agentId: string): Promise<boolean> {
  const data = await readRaw(userId);
  return Boolean(data.activations[agentId]?.enabled);
}

export async function getAgentActivation(
  userId: string,
  agentId: string
): Promise<ActivationEntry | null> {
  const data = await readRaw(userId);
  return data.activations[agentId] ?? null;
}

export async function setAgentEnabledState(
  userId: string,
  agentId: string,
  enabled: boolean
): Promise<ActivationEntry> {
  const data = await readRaw(userId);
  const existing = data.activations[agentId];
  const next: ActivationEntry = {
    enabled,
    activatedAt: existing?.activatedAt ?? new Date().toISOString(),
  };
  data.activations[agentId] = next;
  await writeRaw(userId, data);
  return next;
}

export async function getAllActivations(userId: string): Promise<Record<string, ActivationEntry>> {
  const data = await readRaw(userId);
  return data.activations;
}
