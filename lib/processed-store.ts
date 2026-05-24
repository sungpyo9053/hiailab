import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { MailCategory } from "./classifier";

// 이미 에이전트가 본 메일 ID를 기록. 본문은 절대 저장하지 않는다.
// (Gmail 메일 원문은 분석 직후 폐기됨)

const STORE_DIR = path.join(process.cwd(), ".hiailab");
const STORE_FILE = path.join(STORE_DIR, "processed.json");

const MAX_RECENT = 200; // 최근 처리 로그 N개만 유지

export type ProcessedEntry = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  category: MailCategory;
  draftId?: string; // 답장 초안이 생성된 경우 ID
  draftError?: string;
  processedAt: string; // ISO
};

type StoreFile = {
  version: 1;
  recent: ProcessedEntry[]; // 최근 처리 N건 (최신이 [0])
  seenIds: string[]; // 한 번이라도 본 메일 ID (재처리 방지). 최근 1000개만 유지.
};

const MAX_SEEN = 1000;

async function ensureDir() {
  await fs.mkdir(STORE_DIR, { recursive: true });
}

async function readRaw(): Promise<StoreFile> {
  try {
    const buf = await fs.readFile(STORE_FILE, "utf8");
    const data = JSON.parse(buf) as StoreFile;
    if (data.version === 1 && Array.isArray(data.recent) && Array.isArray(data.seenIds)) {
      return data;
    }
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw err;
  }
  return { version: 1, recent: [], seenIds: [] };
}

async function writeRaw(data: StoreFile): Promise<void> {
  await ensureDir();
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
}

export async function hasSeenMessage(id: string): Promise<boolean> {
  const data = await readRaw();
  return data.seenIds.includes(id);
}

export async function recordProcessed(entry: ProcessedEntry): Promise<void> {
  const data = await readRaw();
  // 최신이 앞으로 오게 prepend
  data.recent = [entry, ...data.recent].slice(0, MAX_RECENT);
  if (!data.seenIds.includes(entry.id)) {
    data.seenIds = [entry.id, ...data.seenIds].slice(0, MAX_SEEN);
  }
  await writeRaw(data);
}

export async function getRecentProcessed(limit: number = 50): Promise<ProcessedEntry[]> {
  const data = await readRaw();
  return data.recent.slice(0, limit);
}

export async function getProcessedCount(): Promise<number> {
  const data = await readRaw();
  return data.seenIds.length;
}
