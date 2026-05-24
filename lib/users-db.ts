import "server-only";
import bcrypt from "bcryptjs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { decryptString, encryptString, hasEncryptionKey } from "./crypto";
import { getGlobalStoreDir, ensureGlobalStoreDir } from "./user-paths";

// 자체 회원가입/로그인 사용자 메타.
// 파일: .hiailab/users-db.enc.json (전체 파일이 AES-256-GCM 암호화)
// 구조:
//   {
//     version: 1,
//     users: [
//       { email, passwordHash, createdAt, role }
//     ]
//   }

export type UserRecord = {
  email: string;          // lowercased
  passwordHash: string;
  createdAt: string;      // ISO
  role: "admin" | "user";
};

type DbFile = {
  version: 1;
  users: UserRecord[];
};

function dbPath(): string {
  return path.join(getGlobalStoreDir(), "users-db.enc.json");
}

async function readRaw(): Promise<DbFile> {
  try {
    const buf = await fs.readFile(dbPath(), "utf8");
    if (!hasEncryptionKey()) {
      // 키 없으면 파일은 못 읽음 (암호화돼 있어서)
      throw new Error("APP_ENCRYPTION_KEY 가 없습니다.");
    }
    const plain = decryptString(buf);
    const data = JSON.parse(plain) as DbFile;
    if (data.version === 1 && Array.isArray(data.users)) return data;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      // ENOENT 가 아닌 다른 에러는 던짐 (decryption 실패 등)
      if ((err as Error).message?.includes("ENOENT")) {
        // ignore
      } else {
        throw err;
      }
    }
  }
  return { version: 1, users: [] };
}

async function writeRaw(data: DbFile): Promise<void> {
  if (!hasEncryptionKey()) {
    throw new Error("APP_ENCRYPTION_KEY 가 없어서 저장 불가.");
  }
  await ensureGlobalStoreDir();
  const enc = encryptString(JSON.stringify(data));
  await fs.writeFile(dbPath(), enc, { encoding: "utf8", mode: 0o600 });
}

export async function findUser(email: string): Promise<UserRecord | null> {
  const db = await readRaw();
  const lo = email.toLowerCase();
  return db.users.find((u) => u.email === lo) ?? null;
}

export async function listUsers(): Promise<UserRecord[]> {
  const db = await readRaw();
  return db.users;
}

export type SignupResult =
  | { ok: true; user: UserRecord }
  | { ok: false; error: string };

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function determineRole(email: string): "admin" | "user" {
  const owner = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
  if (owner && email.toLowerCase() === owner) return "admin";
  return "user";
}

export async function createUser(input: {
  email: string;
  password: string;
}): Promise<SignupResult> {
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, error: "올바른 이메일 주소를 입력해주세요." };
  }
  if (!input.password || input.password.length < 8) {
    return { ok: false, error: "비밀번호는 8자 이상이어야 합니다." };
  }
  const db = await readRaw();
  if (db.users.find((u) => u.email === email)) {
    return { ok: false, error: "이미 가입된 이메일입니다. 로그인해주세요." };
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: UserRecord = {
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
    role: determineRole(email),
  };
  db.users.push(user);
  await writeRaw(db);
  return { ok: true, user };
}

export type LoginResult =
  | { ok: true; user: UserRecord }
  | { ok: false; error: string };

export async function verifyPassword(
  email: string,
  password: string
): Promise<LoginResult> {
  const user = await findUser(email);
  if (!user) {
    // timing attack 방지: 어쨌든 hash 한 번 더 비교
    await bcrypt.compare(password, "$2a$10$abcdefghijklmnopqrstuv");
    return { ok: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." };
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { ok: false, error: "이메일 또는 비밀번호가 일치하지 않습니다." };
  }
  return { ok: true, user };
}
