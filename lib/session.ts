import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// HMAC 으로 서명된 cookie 세션.
// 구조: {payload_b64}.{sig_b64}
// payload: { email, role, iat, exp } JSON

const COOKIE_NAME = "hiailab_sid";
const DEFAULT_TTL_SEC = 60 * 60 * 24 * 30; // 30일

type SessionPayload = {
  email: string;
  role: "admin" | "user";
  iat: number; // 발급 시각 (sec)
  exp: number; // 만료 시각 (sec)
};

function getSigningKey(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("APP_ENCRYPTION_KEY 가 없습니다. cookie session 사용 불가.");
  }
  // session 서명용 별도 키 파생 (encryption key 와 분리)
  return createHash("sha256").update("hiailab-session-v1|" + raw, "utf8").digest();
}

function sign(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const payloadB64 = Buffer.from(json, "utf8")
    .toString("base64url");
  const sig = createHmac("sha256", getSigningKey()).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;

    const expectedSig = createHmac("sha256", getSigningKey()).update(payloadB64).digest("base64url");
    const a = Buffer.from(sig, "base64url");
    const b = Buffer.from(expectedSig, "base64url");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const data = JSON.parse(json) as SessionPayload;

    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof data.exp !== "number" || data.exp < nowSec) return null;
    if (!data.email || typeof data.email !== "string") return null;

    return data;
  } catch {
    return null;
  }
}

export async function setSessionCookie(email: string, role: "admin" | "user"): Promise<void> {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    email: email.toLowerCase(),
    role,
    iat: nowSec,
    exp: nowSec + DEFAULT_TTL_SEC,
  };
  const token = sign(payload);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true, // 운영은 HTTPS — Caddy + nip.io
    path: "/",
    maxAge: DEFAULT_TTL_SEC,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function readSession(): Promise<SessionPayload | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verify(token);
  } catch {
    return null;
  }
}
