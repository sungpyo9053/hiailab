import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { MailCategory } from "./classifier";
import { ensureUserStoreDir, getUserStoreDir } from "./user-paths";

// 사용자별 처리 메일 ID 기록. 본문은 절대 저장 X.

const MAX_RECENT = 200;
const MAX_SEEN = 1000;

export type ProcessedEntry = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  category: MailCategory;
  draftId?: string;
  draftError?: string;
  processedAt: string;
};

type StoreFile = {
  version: 1;
  recent: ProcessedEntry[];
  seenIds: string[];
};

function filePath(userId: string): string {
  return path.join(getUserStoreDir(userId), "processed.json");
}

async function readRaw(userId: string): Promise<StoreFile> {
  try {
    const buf = await fs.readFile(filePath(userId), "utf8");
    const data = JSON.parse(buf) as StoreFile;
    if (data.version === 1 && Array.isArray(data.recent) && Array.isArray(data.seenIds)) {
      return data;
    }
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  return { version: 1, recent: [], seenIds: [] };
}

async function writeRaw(userId: string, data: StoreFile): Promise<void> {
  await ensureUserStoreDir(userId);
  await fs.writeFile(filePath(userId), JSON.stringify(data, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
}

export async function hasSeenMessage(userId: string, id: string): Promise<boolean> {
  const data = await readRaw(userId);
  return data.seenIds.includes(id);
}

export async function recordProcessed(userId: string, entry: ProcessedEntry): Promise<void> {
  const data = await readRaw(userId);
  data.recent = [entry, ...data.recent].slice(0, MAX_RECENT);
  if (!data.seenIds.includes(entry.id)) {
    data.seenIds = [entry.id, ...data.seenIds].slice(0, MAX_SEEN);
  }
  await writeRaw(userId, data);
}

export async function getRecentProcessed(userId: string, limit: number = 50): Promise<ProcessedEntry[]> {
  const data = await readRaw(userId);
  return data.recent.slice(0, limit);
}

export async function getProcessedCount(userId: string): Promise<number> {
  const data = await readRaw(userId);
  return data.seenIds.length;
}
