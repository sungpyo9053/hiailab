import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

// AES-256-GCM. APP_ENCRYPTION_KEY 는 다음 중 한 형식으로 입력:
//   1) 64자 hex (32바이트)
//   2) base64 인코딩된 32바이트 키
//   3) 그 외 임의 문자열 (SHA-256으로 32바이트 파생)
function deriveKey(raw: string): Buffer {
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  try {
    const b = Buffer.from(raw, "base64");
    if (b.length === 32) return b;
  } catch {
    // ignore
  }
  return createHash("sha256").update(raw, "utf8").digest();
}

export function hasEncryptionKey(): boolean {
  return Boolean(process.env.APP_ENCRYPTION_KEY);
}

function getKeyOrThrow(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("APP_ENCRYPTION_KEY가 설정되지 않았습니다.");
  }
  return deriveKey(raw);
}

// 결과 형식: v1.{iv_b64}.{tag_b64}.{ct_b64}
export function encryptString(plain: string): string {
  const key = getKeyOrThrow();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    ct.toString("base64"),
  ].join(".");
}

export function decryptString(enc: string): string {
  const key = getKeyOrThrow();
  const parts = enc.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") {
    throw new Error("잘못된 암호문 형식");
  }
  const iv = Buffer.from(parts[1], "base64");
  const tag = Buffer.from(parts[2], "base64");
  const ct = Buffer.from(parts[3], "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

// /setup 페이지에서 사용할 마스킹 헬퍼.
// "sk-abcd1234efgh" → "sk-****efgh"
// 이메일 "test@gmail.com" → "te****@gmail.com"
export function maskSecret(s: string | null | undefined): string {
  if (!s) return "";
  const str = String(s);
  if (str.length <= 4) return "****";
  // 이메일 형식이면 local part 마스킹
  const at = str.indexOf("@");
  if (at > 0) {
    const local = str.slice(0, at);
    const domain = str.slice(at);
    const head = local.slice(0, Math.min(2, local.length));
    return `${head}****${domain}`;
  }
  // 일반 키: 앞 prefix + **** + 뒤 4자리
  const head = str.slice(0, Math.min(3, str.length));
  const tail = str.slice(-4);
  return `${head}****${tail}`;
}
