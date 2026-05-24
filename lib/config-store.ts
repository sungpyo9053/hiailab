import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { decryptString, encryptString, hasEncryptionKey } from "./crypto";

// 저장 위치: 프로젝트 루트 .hiailab/config.enc.json
// .gitignore 에 등록되어 있어야 한다.
const STORE_DIR = path.join(process.cwd(), ".hiailab");
const STORE_FILE = path.join(STORE_DIR, "config.enc.json");

export type ConfigKey =
  | "OPENAI_API_KEY"
  | "SMTP_HOST"
  | "SMTP_PORT"
  | "SMTP_USER"
  | "SMTP_PASS"
  | "DEFAULT_TO_EMAIL"
  | "KAKAO_ACCESS_TOKEN";

export const ALL_CONFIG_KEYS: ConfigKey[] = [
  "OPENAI_API_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "DEFAULT_TO_EMAIL",
  "KAKAO_ACCESS_TOKEN",
];

// 파일 구조:
// {
//   "version": 1,
//   "values": { "OPENAI_API_KEY": "<encrypted v1.…>", ... }
// }
type StoreFile = {
  version: 1;
  values: Partial<Record<ConfigKey, string>>;
};

async function readRaw(): Promise<StoreFile | null> {
  try {
    const buf = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(buf) as StoreFile;
    if (parsed.version !== 1 || typeof parsed.values !== "object") {
      return null;
    }
    return parsed;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw err;
  }
}

async function writeRaw(data: StoreFile): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
}

// 평문 값 반환 (서버 내부 사용 전용)
export async function loadStoredConfig(): Promise<Partial<Record<ConfigKey, string>>> {
  if (!hasEncryptionKey()) return {};
  const raw = await readRaw();
  if (!raw) return {};
  const out: Partial<Record<ConfigKey, string>> = {};
  for (const k of ALL_CONFIG_KEYS) {
    const enc = raw.values[k];
    if (!enc) continue;
    try {
      out[k] = decryptString(enc);
    } catch {
      // 키가 바뀌었거나 손상 — 무시 (해당 항목은 mock 처리됨)
    }
  }
  return out;
}

export type SaveConfigInput = {
  updates?: Partial<Record<ConfigKey, string>>; // 빈 문자열은 무시
  remove?: ConfigKey[]; // 명시적 삭제
};

export async function saveStoredConfig(input: SaveConfigInput): Promise<void> {
  if (!hasEncryptionKey()) {
    throw new Error(
      "APP_ENCRYPTION_KEY가 설정되지 않아 저장할 수 없습니다."
    );
  }
  const current = (await readRaw()) ?? { version: 1, values: {} };

  if (input.updates) {
    for (const [k, v] of Object.entries(input.updates)) {
      const key = k as ConfigKey;
      if (typeof v !== "string" || v.length === 0) continue;
      current.values[key] = encryptString(v);
    }
  }
  if (input.remove) {
    for (const k of input.remove) {
      delete current.values[k];
    }
  }

  await writeRaw(current);
}
