import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { decryptString, encryptString, hasEncryptionKey } from "./crypto";
import { getGlobalStoreDir, getUserStoreDir, ensureUserStoreDir } from "./user-paths";

// === Config Key 분류 ===
//
// GLOBAL (어드민 = 형이 한 번 설정, 모든 사용자가 공유):
//   - LLM 키: OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY
//   - Google OAuth 앱 (모든 사용자가 같은 OAuth 앱으로 로그인):
//     GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
//
// USER (사용자별로 다름):
//   - Gmail OAuth 토큰: GMAIL_REFRESH_TOKEN, GMAIL_EMAIL
//   - 부가 기능: SMTP_*, KAKAO_ACCESS_TOKEN, DEFAULT_TO_EMAIL

export type GlobalConfigKey =
  | "OPENAI_API_KEY"
  | "GEMINI_API_KEY"
  | "GROQ_API_KEY"
  | "GOOGLE_OAUTH_CLIENT_ID"
  | "GOOGLE_OAUTH_CLIENT_SECRET";

export const ALL_GLOBAL_CONFIG_KEYS: GlobalConfigKey[] = [
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
];

export type UserConfigKey =
  | "GMAIL_REFRESH_TOKEN"
  | "GMAIL_EMAIL"
  | "SMTP_HOST"
  | "SMTP_PORT"
  | "SMTP_USER"
  | "SMTP_PASS"
  | "DEFAULT_TO_EMAIL"
  | "KAKAO_ACCESS_TOKEN";

export const ALL_USER_CONFIG_KEYS: UserConfigKey[] = [
  "GMAIL_REFRESH_TOKEN",
  "GMAIL_EMAIL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "DEFAULT_TO_EMAIL",
  "KAKAO_ACCESS_TOKEN",
];

// 모든 키 통합 (UI에서 입력 가능한 키 전체)
export type ConfigKey = GlobalConfigKey | UserConfigKey;
export const ALL_CONFIG_KEYS: ConfigKey[] = [
  ...ALL_GLOBAL_CONFIG_KEYS,
  ...ALL_USER_CONFIG_KEYS,
];

type StoreFile<K extends string> = {
  version: 1;
  values: Partial<Record<K, string>>;
};

// === Global Config 파일 (.hiailab/config.enc.json) ===
function globalFilePath(): string {
  return path.join(getGlobalStoreDir(), "config.enc.json");
}

// === User Config 파일 (.hiailab/users/<id>/config.enc.json or .hiailab/config.enc.json for _self) ===
function userFilePath(userId: string): string {
  return path.join(getUserStoreDir(userId), "config.enc.json");
}

async function readRaw<K extends string>(file: string): Promise<StoreFile<K> | null> {
  try {
    const buf = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(buf) as StoreFile<K>;
    if (parsed.version !== 1 || typeof parsed.values !== "object") return null;
    return parsed;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function writeRaw<K extends string>(file: string, data: StoreFile<K>): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), { encoding: "utf8", mode: 0o600 });
}

// ====== GLOBAL ======

export async function loadGlobalConfig(): Promise<Partial<Record<GlobalConfigKey, string>>> {
  if (!hasEncryptionKey()) return {};
  const raw = await readRaw<GlobalConfigKey>(globalFilePath());
  if (!raw) return {};
  const out: Partial<Record<GlobalConfigKey, string>> = {};
  for (const k of ALL_GLOBAL_CONFIG_KEYS) {
    const enc = raw.values[k];
    if (!enc) continue;
    try {
      out[k] = decryptString(enc);
    } catch {
      // 복호화 실패 — 키 변경 등. 무시.
    }
  }
  return out;
}

export type SaveGlobalInput = {
  updates?: Partial<Record<GlobalConfigKey, string>>;
  remove?: GlobalConfigKey[];
};

export async function saveGlobalConfig(input: SaveGlobalInput): Promise<void> {
  if (!hasEncryptionKey()) {
    throw new Error("APP_ENCRYPTION_KEY 가 없어서 저장 불가.");
  }
  const file = globalFilePath();
  const current =
    (await readRaw<GlobalConfigKey>(file)) ?? ({ version: 1, values: {} } as StoreFile<GlobalConfigKey>);
  if (input.updates) {
    for (const [k, v] of Object.entries(input.updates)) {
      if (typeof v !== "string" || v.length === 0) continue;
      current.values[k as GlobalConfigKey] = encryptString(v);
    }
  }
  if (input.remove) {
    for (const k of input.remove) delete current.values[k];
  }
  await writeRaw(file, current);
}

// ====== USER ======

export async function loadUserConfig(userId: string): Promise<Partial<Record<UserConfigKey, string>>> {
  if (!hasEncryptionKey()) return {};
  const file = userFilePath(userId);
  // _self 모드는 .hiailab/config.enc.json 에 global + user 가 섞여있을 수 있음 (기존 호환).
  // 그래서 단일 파일에서 user keys 만 추출.
  const raw = await readRaw<ConfigKey>(file);
  if (!raw) return {};
  const out: Partial<Record<UserConfigKey, string>> = {};
  for (const k of ALL_USER_CONFIG_KEYS) {
    const enc = raw.values[k];
    if (!enc) continue;
    try {
      out[k] = decryptString(enc);
    } catch {
      // ignore
    }
  }
  return out;
}

export type SaveUserInput = {
  updates?: Partial<Record<UserConfigKey, string>>;
  remove?: UserConfigKey[];
};

export async function saveUserConfig(userId: string, input: SaveUserInput): Promise<void> {
  if (!hasEncryptionKey()) {
    throw new Error("APP_ENCRYPTION_KEY 가 없어서 저장 불가.");
  }
  await ensureUserStoreDir(userId);
  const file = userFilePath(userId);
  const current = (await readRaw<ConfigKey>(file)) ?? ({ version: 1, values: {} } as StoreFile<ConfigKey>);
  if (input.updates) {
    for (const [k, v] of Object.entries(input.updates)) {
      if (typeof v !== "string" || v.length === 0) continue;
      current.values[k as ConfigKey] = encryptString(v);
    }
  }
  if (input.remove) {
    for (const k of input.remove) delete current.values[k];
  }
  await writeRaw(file, current);
}

// ====== 하위 호환 헬퍼 ======
// 기존 코드가 loadStoredConfig() / saveStoredConfig() 를 호출하던 곳이 많음.
// _self 모드일 때 같은 파일에 global + user 모두 들어가있던 상태이므로 그대로 동작.

export async function loadStoredConfig(userId: string = "_self"): Promise<Partial<Record<ConfigKey, string>>> {
  const [g, u] = await Promise.all([
    loadGlobalConfig(),
    loadUserConfig(userId),
  ]);
  return { ...g, ...u };
}

export async function saveStoredConfig(
  input: { updates?: Partial<Record<ConfigKey, string>>; remove?: ConfigKey[] },
  userId: string = "_self"
): Promise<void> {
  // updates / remove 를 global vs user 로 자동 분류
  const globalUpdates: Partial<Record<GlobalConfigKey, string>> = {};
  const userUpdates: Partial<Record<UserConfigKey, string>> = {};
  if (input.updates) {
    for (const [k, v] of Object.entries(input.updates)) {
      if (typeof v !== "string") continue;
      if (ALL_GLOBAL_CONFIG_KEYS.includes(k as GlobalConfigKey)) {
        globalUpdates[k as GlobalConfigKey] = v;
      } else if (ALL_USER_CONFIG_KEYS.includes(k as UserConfigKey)) {
        userUpdates[k as UserConfigKey] = v;
      }
    }
  }
  const globalRemove: GlobalConfigKey[] = [];
  const userRemove: UserConfigKey[] = [];
  if (input.remove) {
    for (const k of input.remove) {
      if (ALL_GLOBAL_CONFIG_KEYS.includes(k as GlobalConfigKey)) {
        globalRemove.push(k as GlobalConfigKey);
      } else if (ALL_USER_CONFIG_KEYS.includes(k as UserConfigKey)) {
        userRemove.push(k as UserConfigKey);
      }
    }
  }
  await Promise.all([
    Object.keys(globalUpdates).length || globalRemove.length
      ? saveGlobalConfig({ updates: globalUpdates, remove: globalRemove })
      : Promise.resolve(),
    Object.keys(userUpdates).length || userRemove.length
      ? saveUserConfig(userId, { updates: userUpdates, remove: userRemove })
      : Promise.resolve(),
  ]);
}
