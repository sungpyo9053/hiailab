import "server-only";
import { loadStoredConfig, type ConfigKey } from "./config-store";
import { maskSecret } from "./crypto";

// process.env 값이 있으면 우선. 없으면 저장된 config 값.
// 둘 다 없으면 null → 호출 측에서 mock 모드로 동작한다.
async function resolveValue(key: ConfigKey): Promise<string | null> {
  const env = process.env[key];
  if (env && env.trim()) return env;
  const stored = await loadStoredConfig();
  const v = stored[key];
  return v && v.trim() ? v : null;
}

// 어디서 왔는지(env / stored / none) 같이 알려주는 헬퍼.
async function resolveWithSource(
  key: ConfigKey
): Promise<{ value: string | null; source: "env" | "stored" | "none" }> {
  const env = process.env[key];
  if (env && env.trim()) return { value: env, source: "env" };
  const stored = await loadStoredConfig();
  const v = stored[key];
  if (v && v.trim()) return { value: v, source: "stored" };
  return { value: null, source: "none" };
}

export async function getOpenAIKey(): Promise<string | null> {
  return resolveValue("OPENAI_API_KEY");
}

export async function getKakaoAccessToken(): Promise<string | null> {
  return resolveValue("KAKAO_ACCESS_TOKEN");
}

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  defaultTo: string | null;
};

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const [host, portStr, user, pass, defaultTo] = await Promise.all([
    resolveValue("SMTP_HOST"),
    resolveValue("SMTP_PORT"),
    resolveValue("SMTP_USER"),
    resolveValue("SMTP_PASS"),
    resolveValue("DEFAULT_TO_EMAIL"),
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

export type RuntimeModes = {
  ai: RuntimeMode;
  email: RuntimeMode;
  kakao: RuntimeMode;
};

export async function getRuntimeModes(): Promise<RuntimeModes> {
  const [openai, smtp, kakao] = await Promise.all([
    getOpenAIKey(),
    getSmtpConfig(),
    getKakaoAccessToken(),
  ]);
  return {
    ai: openai ? "real" : "mock",
    email: smtp ? "real" : "mock",
    kakao: kakao ? "real" : "mock",
  };
}

// /api/setup/status 가 쓰는 뷰
export type SetupStatus = {
  openai: { configured: boolean; masked: string; source: "env" | "stored" | "none" };
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
  ownerEmail: string | null; // env 에서만 읽음 (보안상 마스킹 없이 노출 OK — 이메일 주소이지 비밀번호 아님)
};

export async function getSetupStatus(): Promise<SetupStatus> {
  const [openai, host, portStr, user, pass, defaultTo, kakao, gClientId, gClientSecret] =
    await Promise.all([
      resolveWithSource("OPENAI_API_KEY"),
      resolveWithSource("SMTP_HOST"),
      resolveWithSource("SMTP_PORT"),
      resolveWithSource("SMTP_USER"),
      resolveWithSource("SMTP_PASS"),
      resolveWithSource("DEFAULT_TO_EMAIL"),
      resolveWithSource("KAKAO_ACCESS_TOKEN"),
      resolveWithSource("GOOGLE_OAUTH_CLIENT_ID"),
      resolveWithSource("GOOGLE_OAUTH_CLIENT_SECRET"),
    ]);

  const smtpConfigured = Boolean(host.value && user.value && pass.value);
  const smtpSources = new Set(
    [host, user, pass]
      .map((x) => x.source)
      .filter((s) => s !== "none")
  );
  let smtpSource: SetupStatus["smtp"]["source"] = "none";
  if (smtpConfigured) {
    smtpSource = smtpSources.size === 1
      ? (smtpSources.has("env") ? "env" : "stored")
      : "mixed";
  }

  const googleSources = new Set(
    [gClientId, gClientSecret].map((x) => x.source).filter((s) => s !== "none")
  );
  let googleSource: SetupStatus["google"]["source"] = "none";
  if (gClientId.value && gClientSecret.value) {
    googleSource = googleSources.size === 1
      ? (googleSources.has("env") ? "env" : "stored")
      : "mixed";
  }

  const modes = await getRuntimeModes();

  return {
    openai: {
      configured: Boolean(openai.value),
      masked: maskSecret(openai.value),
      source: openai.source,
    },
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
    kakao: {
      configured: Boolean(kakao.value),
      masked: maskSecret(kakao.value),
      source: kakao.source,
    },
    modes,
    encryption: { configured: Boolean(process.env.APP_ENCRYPTION_KEY) },
    hasDefaultTo: Boolean(defaultTo.value),
    ownerEmail: (process.env.OWNER_EMAIL || "").trim() || null,
  };
}
