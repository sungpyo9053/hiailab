import "server-only";
import { loadGlobalConfig, loadUserConfig, saveUserConfig } from "./config-store";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
const USERINFO_API = "https://www.googleapis.com/oauth2/v2/userinfo";

// === OAuth 앱 정보 (global — admin 이 한 번 설정) ===
async function readOAuthApp(): Promise<{ clientId: string; clientSecret: string } | null> {
  const env = process.env;
  if (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET) {
    return {
      clientId: env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    };
  }
  const g = await loadGlobalConfig();
  if (g.GOOGLE_OAUTH_CLIENT_ID && g.GOOGLE_OAUTH_CLIENT_SECRET) {
    return {
      clientId: g.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: g.GOOGLE_OAUTH_CLIENT_SECRET,
    };
  }
  return null;
}

// === 사용자 refresh token (user-scoped) ===
async function readUserCreds(
  userId: string
): Promise<{ clientId: string; clientSecret: string; refreshToken: string } | null> {
  const app = await readOAuthApp();
  if (!app) return null;
  // refresh token 은 우선 env (단일 self 케이스), 그다음 user config
  const env = process.env;
  let refreshToken: string | undefined;
  if (userId === "_self" && env.GMAIL_REFRESH_TOKEN) {
    refreshToken = env.GMAIL_REFRESH_TOKEN;
  } else {
    const u = await loadUserConfig(userId);
    refreshToken = u.GMAIL_REFRESH_TOKEN;
  }
  if (!refreshToken) return null;
  return { ...app, refreshToken };
}

export function buildRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/gmail/callback`;
}

export async function buildAuthorizeUrl(state: string): Promise<string | null> {
  const app = await readOAuthApp();
  if (!app) return null;
  const params = new URLSearchParams({
    client_id: app.clientId,
    redirect_uri: buildRedirectUri(),
    response_type: "code",
    scope: GMAIL_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

// OAuth 콜백에서 호출 — code → tokens → user 의 refresh_token 저장.
// userId 가 null 이면 응답의 email 로 결정 (saas 로그인 흐름).
export async function exchangeCodeForTokens(
  code: string,
  userIdHint: string | null
): Promise<{
  refresh_token: string;
  access_token: string;
  expires_in: number;
  email: string;
} | null> {
  const app = await readOAuthApp();
  if (!app) return null;

  const form = new URLSearchParams({
    code,
    client_id: app.clientId,
    client_secret: app.clientSecret,
    redirect_uri: buildRedirectUri(),
    grant_type: "authorization_code",
  });
  const resp = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!resp.ok) return null;

  const data = (await resp.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!data.access_token || !data.refresh_token) return null;

  // userinfo 조회
  const userInfo = await fetch(USERINFO_API, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  let email = "";
  if (userInfo.ok) {
    const u = (await userInfo.json()) as { email?: string };
    email = u.email ?? "";
  }

  // 저장할 userId 결정 (saas: email, self: _self)
  const targetUserId = userIdHint ?? (email ? email.toLowerCase() : "_self");

  await saveUserConfig(targetUserId, {
    updates: {
      GMAIL_REFRESH_TOKEN: data.refresh_token,
      GMAIL_EMAIL: email,
    },
  });

  return {
    refresh_token: data.refresh_token,
    access_token: data.access_token,
    expires_in: data.expires_in ?? 3600,
    email,
  };
}

// 사용자별 access token 캐시 (메모리)
const tokenCache = new Map<string, { value: string; expiresAt: number }>();

async function getAccessToken(userId: string): Promise<string | null> {
  const now = Date.now();
  const cached = tokenCache.get(userId);
  if (cached && cached.expiresAt > now + 30_000) return cached.value;

  const creds = await readUserCreds(userId);
  if (!creds) return null;

  const form = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: creds.refreshToken,
    grant_type: "refresh_token",
  });
  const resp = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!resp.ok) {
    console.error("[gmail] 액세스 토큰 갱신 실패", { status: resp.status, userId });
    return null;
  }
  const data = (await resp.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;
  tokenCache.set(userId, {
    value: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  });
  return data.access_token;
}

export async function isGmailConnected(userId: string): Promise<boolean> {
  return (await readUserCreds(userId)) !== null;
}

export async function disconnectGmail(userId: string): Promise<void> {
  const { saveUserConfig } = await import("./config-store");
  await saveUserConfig(userId, { remove: ["GMAIL_REFRESH_TOKEN", "GMAIL_EMAIL"] });
  tokenCache.delete(userId);
}

export async function getConnectedEmail(userId: string): Promise<string | null> {
  if (userId === "_self" && process.env.GMAIL_EMAIL) return process.env.GMAIL_EMAIL;
  const u = await loadUserConfig(userId);
  return u.GMAIL_EMAIL ?? null;
}

// === Gmail API ===

export type GmailMessageSummary = { id: string; threadId: string };
export type GmailMessage = {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  messageIdHeader: string;
};

async function gmailFetch(userId: string, p: string, init?: RequestInit): Promise<Response | null> {
  const token = await getAccessToken(userId);
  if (!token) return null;
  const url = p.startsWith("http") ? p : `${GMAIL_API}${p}`;
  return fetch(url, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}

export async function listRecentInboxMessageIds(
  userId: string,
  query: string = "in:inbox newer_than:1d"
): Promise<GmailMessageSummary[]> {
  const params = new URLSearchParams({ q: query, maxResults: "25" });
  const resp = await gmailFetch(userId, `/messages?${params.toString()}`);
  if (!resp || !resp.ok) return [];
  const data = (await resp.json()) as { messages?: { id: string; threadId: string }[] };
  return data.messages ?? [];
}

function decodeBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0;
  return Buffer.from(b64 + "=".repeat(pad), "base64").toString("utf8");
}

type GmailPayload = {
  mimeType?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string };
  parts?: GmailPayload[];
};

function extractTextBody(payload: GmailPayload): string {
  if (!payload) return "";
  if (payload.body?.data && payload.mimeType?.startsWith("text/plain")) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts) {
    const plain = payload.parts.find((p) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);
    const html = payload.parts.find((p) => p.mimeType === "text/html");
    if (html?.body?.data) {
      const raw = decodeBase64Url(html.body.data);
      return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
    for (const p of payload.parts) {
      const t = extractTextBody(p as GmailPayload);
      if (t) return t;
    }
  }
  return "";
}

export async function getMessage(userId: string, id: string): Promise<GmailMessage | null> {
  const resp = await gmailFetch(userId, `/messages/${id}?format=full`);
  if (!resp || !resp.ok) return null;
  const data = (await resp.json()) as {
    id: string;
    threadId: string;
    snippet?: string;
    payload?: GmailPayload;
  };
  const headers = data.payload?.headers ?? [];
  const find = (n: string) =>
    headers.find((h) => h.name.toLowerCase() === n.toLowerCase())?.value ?? "";

  const body = extractTextBody(data.payload ?? {});
  return {
    id: data.id,
    threadId: data.threadId,
    from: find("From"),
    to: find("To"),
    subject: find("Subject"),
    date: find("Date"),
    snippet: data.snippet ?? "",
    body,
    messageIdHeader: find("Message-ID"),
  };
}

function rfc2047(value: string): string {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function buildRfc822(opts: { to: string; subject: string; body: string; inReplyTo?: string }): string {
  const lines: string[] = [];
  lines.push(`To: ${rfc2047(opts.to)}`);
  lines.push(`Subject: ${rfc2047(opts.subject)}`);
  if (opts.inReplyTo) {
    lines.push(`In-Reply-To: ${opts.inReplyTo}`);
    lines.push(`References: ${opts.inReplyTo}`);
  }
  lines.push("MIME-Version: 1.0");
  lines.push("Content-Type: text/plain; charset=UTF-8");
  lines.push("Content-Transfer-Encoding: 8bit");
  lines.push("");
  lines.push(opts.body);
  return lines.join("\r\n");
}

export async function createReplyDraft(
  userId: string,
  opts: { to: string; subject: string; body: string; threadId: string; inReplyToMessageId?: string }
): Promise<{ ok: boolean; draftId?: string; error?: string }> {
  const rfc822 = buildRfc822({
    to: opts.to,
    subject: opts.subject,
    body: opts.body,
    inReplyTo: opts.inReplyToMessageId,
  });
  const raw = Buffer.from(rfc822, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const resp = await gmailFetch(userId, "/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: { raw, threadId: opts.threadId } }),
  });
  if (!resp) return { ok: false, error: "Gmail 미연결" };
  if (!resp.ok) return { ok: false, error: `Gmail Drafts API 실패 (status ${resp.status})` };
  const data = (await resp.json()) as { id?: string };
  return { ok: true, draftId: data.id };
}
