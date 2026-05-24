import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

// 사용자별 저장 디렉토리 결정.
// - userId === "_self": 기존 .hiailab/ (셀프호스팅 호환)
// - 그 외 (saas):       .hiailab/users/<sanitized-email>/

const ROOT = path.join(process.cwd(), ".hiailab");

function sanitize(id: string): string {
  // 파일시스템 안전화 — email 도 그대로 두면 OK (가정: ascii email)
  // 한국어/공백/슬래시 들어오면 안전치환
  return id.replace(/[^a-zA-Z0-9._@-]/g, "_").toLowerCase();
}

export function getUserStoreDir(userId: string): string {
  if (userId === "_self") return ROOT;
  return path.join(ROOT, "users", sanitize(userId));
}

export async function ensureUserStoreDir(userId: string): Promise<string> {
  const dir = getUserStoreDir(userId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

// 글로벌(어드민/시스템) config 위치 — 항상 .hiailab/ 루트.
export function getGlobalStoreDir(): string {
  return ROOT;
}

export async function ensureGlobalStoreDir(): Promise<string> {
  await fs.mkdir(ROOT, { recursive: true });
  return ROOT;
}

// 모든 saas 사용자 디렉토리 목록 (agent-loop 의 다중 사용자 순회용)
export async function listAllUserIds(): Promise<string[]> {
  const usersDir = path.join(ROOT, "users");
  try {
    const entries = await fs.readdir(usersDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}
