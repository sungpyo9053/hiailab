import "server-only";
import { loadStoredConfig, saveStoredConfig } from "./config-store";

// Gmail OAuth + API 래퍼.
// 의존성 최소화를 위해 googleapis 패키지 대신 fetch 직접 사용.

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose", // drafts.create 가능
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
const USERINFO_API = "https://www.googleapis.com/oauth2/v2/userinfo";

export type GmailCreds = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

async function readCreds(): Promise<GmailCreds | null> {
  const env = process.env;
  if (
    env.GOOGLE_OAUTH_CLIENT_ID &&
    env.GOOGLE_OAUTH_CLIENT_SECRET &&
    env.GMAIL_REFRESH_TOKEN
  ) {
    return {
      clientId: env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      refreshToken: env.GMAIL_REFRESH_TOKEN,
    };
  }
  const stored = await loadStoredConfig();
  if (
    stored.GOOGLE_OAUTH_CLIENT_ID &&
    stored.GOOGLE_OAUTH_CLIENT_SECRET &&
    stored.GMAIL_REFRESH_TOKEN
  ) {
    return {
      clientId: stored.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: stored.GOOGLE_OAUTH_CLIENT_SECRET,
      refreshToken: stored.GMAIL_REFRESH_TOKEN,
    };
  }
  return null;
}

async function readOAuthApp(): Promise<{ clientId: string; clientSecret: string } | null> {
  const env = process.env;
  if (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET) {
    return {
      clientId: env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    };
  }
  const stored = await loadStoredConfig();
  if (stored.GOOGLE_OAUTH_CLIENT_ID && stored.GOOGLE_OAUTH_CLIENT_SECRET) {
    return {
      clientId: stored.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: stored.GOOGLE_OAUTH_CLIENT_SECRET,
    };
  }
  return null;
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

export async function exchangeCodeForTokens(code: string): Promise<{
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
  if (!resp.ok) {
    return null;
  }
  const data = (await resp.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!data.access_token || !data.refresh_token) {
    return null;
  }

  // 사용자 이메일 조회
  const userInfo = await fetch(USERINFO_API, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  let email = "";
  if (userInfo.ok) {
    const u = (await userInfo.json()) as { email?: string };
    email = u.email ?? "";
  }

  // refresh_token + email 을 저장 (access_token 은 매번 갱신)
  await saveStoredConfig({
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

// 액세스 토큰 캐시 (메모리). 만료 30초 전부터 재발급.
let cachedAccessToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 30_000) {
    return cachedAccessToken.value;
  }
  const creds = await readCreds();
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
    console.error("[gmail] 액세스 토큰 갱신 실패", { status: resp.status });
    return null;
  }
  const data = (await resp.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) return null;
  cachedAccessToken = {
    value: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };
  return cachedAccessToken.value;
}

export async function isGmailConnected(): Promise<boolean> {
  const creds = await readCreds();
  return Boolean(creds);
}

export async function disconnectGmail(): Promise<void> {
  await saveStoredConfig({
    remove: ["GMAIL_REFRESH_TOKEN", "GMAIL_EMAIL"],
  });
  cachedAccessToken = null;
}

export async function getConnectedEmail(): Promise<string | null> {
  const env = process.env.GMAIL_EMAIL;
  if (env) return env;
  const stored = await loadStoredConfig();
  return stored.GMAIL_EMAIL ?? null;
}

// === Gmail API 호출 ===

export type GmailMessageSummary = {
  id: string;
  threadId: string;
};

export type GmailMessage = {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  messageIdHeader: string; // RFC822 Message-ID (스레드 답장에 필요)
};

async function gmailFetch(path: string, init?: RequestInit): Promise<Response | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const url = path.startsWith("http") ? path : `${GMAIL_API}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

// 새 받은편지함 메일 ID 목록 (읽음 처리 X, 받은편지함 + 미답장 + 최근 1일 등 q 옵션)
export async function listRecentInboxMessageIds(
  query: string = "in:inbox newer_than:1d"
): Promise<GmailMessageSummary[]> {
  const params = new URLSearchParams({ q: query, maxResults: "25" });
  const resp = await gmailFetch(`/messages?${params.toString()}`);
  if (!resp || !resp.ok) return [];
  const data = (await resp.json()) as {
    messages?: { id: string; threadId: string }[];
  };
  return data.messages ?? [];
}

function decodeBase64Url(s: string): string {
  // base64url → base64 → 문자열
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0;
  return Buffer.from(b64 + "=".repeat(pad), "base64").toString("utf8");
}

function extractTextBody(payload: GmailPayload): string {
  if (!payload) return "";
  // 단일 part
  if (payload.body?.data && payload.mimeType?.startsWith("text/plain")) {
    return decodeBase64Url(payload.body.data);
  }
  // multipart
  if (payload.parts) {
    // text/plain 우선
    const plain = payload.parts.find((p) => p.mimeType === "text/plain");
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);
    // text/html fallback (HTML 태그 제거 간단)
    const html = payload.parts.find((p) => p.mimeType === "text/html");
    if (html?.body?.data) {
      const raw = decodeBase64Url(html.body.data);
      return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
    // 재귀
    for (const p of payload.parts) {
      const t = extractTextBody(p as GmailPayload);
      if (t) return t;
    }
  }
  return "";
}

type GmailPayload = {
  mimeType?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string };
  parts?: GmailPayload[];
};

export async function getMessage(id: string): Promise<GmailMessage | null> {
  // metadata 만으로는 본문이 없어서 format=full 사용
  const resp = await gmailFetch(`/messages/${id}?format=full`);
  if (!resp || !resp.ok) return null;
  const data = (await resp.json()) as {
    id: string;
    threadId: string;
    snippet?: string;
    payload?: GmailPayload;
  };
  const headers = data.payload?.headers ?? [];
  const findHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

  const body = extractTextBody(data.payload ?? {});

  return {
    id: data.id,
    threadId: data.threadId,
    from: findHeader("From"),
    to: findHeader("To"),
    subject: findHeader("Subject"),
    date: findHeader("Date"),
    snippet: data.snippet ?? "",
    body,
    messageIdHeader: findHeader("Message-ID"),
  };
}

// 답장 초안을 임시보관함에 생성. 자동 발송 X.
export async function createReplyDraft(opts: {
  to: string;
  subject: string;
  body: string;
  threadId: string;
  inReplyToMessageId?: string;
}): Promise<{ ok: boolean; draftId?: string; error?: string }> {
  const rfc822 = buildRfc822({
    to: opts.to,
    subject: opts.subject,
    body: opts.body,
    inReplyTo: opts.inReplyToMessageId,
  });

  // RFC822 → base64url
  const raw = Buffer.from(rfc822, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const resp = await gmailFetch("/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        raw,
        threadId: opts.threadId,
      },
    }),
  });
  if (!resp) return { ok: false, error: "Gmail 미연결" };
  if (!resp.ok) {
    return { ok: false, error: `Gmail Drafts API 실패 (status ${resp.status})` };
  }
  const data = (await resp.json()) as { id?: string };
  return { ok: true, draftId: data.id };
}

function buildRfc822(opts: {
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
}): string {
  const lines: string[] = [];
  lines.push(`To: ${opts.to}`);
  // RFC2047 인코딩 (한글 제목 안전)
  const encSubject = `=?UTF-8?B?${Buffer.from(opts.subject, "utf8").toString("base64")}?=`;
  lines.push(`Subject: ${encSubject}`);
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
