import "server-only";
import { loadGlobalConfig, loadUserConfig, type GlobalConfigKey, type UserConfigKey } from "./config-store";
import { maskSecret } from "./crypto";

// process.env 값이 있으면 우선. 없으면 저장된 config.
// LLM 키와 Google OAuth 앱은 global. 그 외 (Gmail token, SMTP, Kakao) 는 user-scoped.

async function resolveGlobal(
  key: GlobalConfigKey
): Promise<string | null> {
  const env = process.env[key];
  if (env && env.trim()) return env;
  const g = await loadGlobalConfig();
  return g[key] && g[key]!.trim() ? g[key]! : null;
}

async function resolveGlobalWithSource(
  key: GlobalConfigKey
): Promise<{ value: string | null; source: "env" | "stored" | "none" }> {
  const env = process.env[key];
  if (env && env.trim()) return { value: env, source: "env" };
  const g = await loadGlobalConfig();
  const v = g[key];
  if (v && v.trim()) return { value: v, source: "stored" };
  return { value: null, source: "none" };
}

async function resolveUser(userId: string, key: UserConfigKey): Promise<string | null> {
  // self 모드 호환: env 우선
  if (userId === "_self") {
    const env = process.env[key];
    if (env && env.trim()) return env;
  }
  const u = await loadUserConfig(userId);
  return u[key] && u[key]!.trim() ? u[key]! : null;
}

async function resolveUserWithSource(
  userId: string,
  key: UserConfigKey
): Promise<{ value: string | null; source: "env" | "stored" | "none" }> {
  if (userId === "_self") {
    const env = process.env[key];
    if (env && env.trim()) return { value: env, source: "env" };
  }
  const u = await loadUserConfig(userId);
  const v = u[key];
  if (v && v.trim()) return { value: v, source: "stored" };
  return { value: null, source: "none" };
}

// ===== LLM (global) =====

export async function getOpenAIKey(): Promise<string | null> {
  return resolveGlobal("OPENAI_API_KEY");
}

export async function getGeminiKey(): Promise<string | null> {
  return resolveGlobal("GEMINI_API_KEY");
}

export async function getGroqKey(): Promise<string | null> {
  return resolveGlobal("GROQ_API_KEY");
}

export async function getKakaoAccessToken(userId: string): Promise<string | null> {
  return resolveUser(userId, "KAKAO_ACCESS_TOKEN");
}

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  defaultTo: string | null;
};

export async function getSmtpConfig(userId: string): Promise<SmtpConfig | null> {
  const [host, portStr, user, pass, defaultTo] = await Promise.all([
    resolveUser(userId, "SMTP_HOST"),
    resolveUser(userId, "SMTP_PORT"),
    resolveUser(userId, "SMTP_USER"),
    resolveUser(userId, "SMTP_PASS"),
    resolveUser(userId, "DEFAULT_TO_EMAIL"),
  ]);
  if (!host || !user || !pass) return null;
  const port = Number(portStr ?? "587");
  return {
    host,
    port: Number.isFinite(port) && port > 0 ? port : 587,
    user,
    pass,
    defaultTo: defaultTo || null,
  };
}

export type RuntimeMode = "real" | "mock";
export type RuntimeModes = { ai: RuntimeMode; email: RuntimeMode; kakao: RuntimeMode };

export async function getRuntimeModes(userId: string): Promise<RuntimeModes> {
  const [openai, gemini, groq, smtp, kakao] = await Promise.all([
    getOpenAIKey(),
    getGeminiKey(),
    getGroqKey(),
    getSmtpConfig(userId),
    getKakaoAccessToken(userId),
  ]);
  return {
    ai: openai || gemini || groq ? "real" : "mock",
    email: smtp ? "real" : "mock",
    kakao: kakao ? "real" : "mock",
  };
}

// ===== /api/setup/status 뷰 =====

export type SetupStatus = {
  openai: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  gemini: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  groq: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  activeProvider: "groq" | "gemini" | "openai" | "none";
  google: {
    clientIdConfigured: boolean;
    clientSecretConfigured: boolean;
    clientIdMasked: string;
    source: "env" | "stored" | "mixed" | "none";
  };
  smtp: {
    configured: boolean;
    hostMasked: string;
    port: number | null;
    userMasked: string;
    hasPass: boolean;
    defaultToMasked: string;
    source: "env" | "stored" | "mixed" | "none";
  };
  kakao: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
  modes: RuntimeModes;
  encryption: { configured: boolean };
  hasDefaultTo: boolean;
  ownerEmail: string | null;
};

export async function getSetupStatus(userId: string): Promise<SetupStatus> {
  const [openai, gemini, groq, gClientId, gClientSecret, host, portStr, user, pass, defaultTo, kakao] =
    await Promise.all([
      resolveGlobalWithSource("OPENAI_API_KEY"),
      resolveGlobalWithSource("GEMINI_API_KEY"),
      resolveGlobalWithSource("GROQ_API_KEY"),
      resolveGlobalWithSource("GOOGLE_OAUTH_CLIENT_ID"),
      resolveGlobalWithSource("GOOGLE_OAUTH_CLIENT_SECRET"),
      resolveUserWithSource(userId, "SMTP_HOST"),
      resolveUserWithSource(userId, "SMTP_PORT"),
      resolveUserWithSource(userId, "SMTP_USER"),
      resolveUserWithSource(userId, "SMTP_PASS"),
      resolveUserWithSource(userId, "DEFAULT_TO_EMAIL"),
      resolveUserWithSource(userId, "KAKAO_ACCESS_TOKEN"),
    ]);

  const smtpConfigured = Boolean(host.value && user.value && pass.value);
  const smtpSources = new Set(
    [host, user, pass].map((x) => x.source).filter((s) => s !== "none")
  );
  let smtpSource: SetupStatus["smtp"]["source"] = "none";
  if (smtpConfigured) {
    smtpSource =
      smtpSources.size === 1 ? (smtpSources.has("env") ? "env" : "stored") : "mixed";
  }

  const googleSources = new Set(
    [gClientId, gClientSecret].map((x) => x.source).filter((s) => s !== "none")
  );
  let googleSource: SetupStatus["google"]["source"] = "none";
  if (gClientId.value && gClientSecret.value) {
    googleSource =
      googleSources.size === 1 ? (googleSources.has("env") ? "env" : "stored") : "mixed";
  }

  const modes = await getRuntimeModes(userId);

  let activeProvider: SetupStatus["activeProvider"] = "none";
  if (groq.value) activeProvider = "groq";
  else if (gemini.value) activeProvider = "gemini";
  else if (openai.value) activeProvider = "openai";

  return {
    openai: { configured: Boolean(openai.value), masked: maskSecret(openai.value), source: openai.source },
    gemini: { configured: Boolean(gemini.value), masked: maskSecret(gemini.value), source: gemini.source },
    groq: { configured: Boolean(groq.value), masked: maskSecret(groq.value), source: groq.source },
    activeProvider,
    google: {
      clientIdConfigured: Boolean(gClientId.value),
      clientSecretConfigured: Boolean(gClientSecret.value),
      clientIdMasked: maskSecret(gClientId.value),
      source: googleSource,
    },
    smtp: {
      configured: smtpConfigured,
      hostMasked: host.value ?? "",
      port: portStr.value ? Number(portStr.value) : null,
      userMasked: maskSecret(user.value),
      hasPass: Boolean(pass.value),
      defaultToMasked: maskSecret(defaultTo.value),
      source: smtpSource,
    },
    kakao: { configured: Boolean(kakao.value), masked: maskSecret(kakao.value), source: kakao.source },
    modes,
    encryption: { configured: Boolean(process.env.APP_ENCRYPTION_KEY) },
    hasDefaultTo: Boolean(defaultTo.value),
    ownerEmail: (process.env.OWNER_EMAIL || "").trim() || null,
  };
}
