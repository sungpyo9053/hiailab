import { NextRequest, NextResponse } from "next/server";
import {
  ALL_CONFIG_KEYS,
  type ConfigKey,
  saveStoredConfig,
} from "@/lib/config-store";
import { hasEncryptionKey } from "@/lib/crypto";
import { getSetupStatus } from "@/lib/server-config";

export const runtime = "nodejs";

type SaveBody = {
  updates?: Record<string, unknown>;
  remove?: string[];
};

// 화이트리스트만 통과시킨다 — 들어온 키가 ALL_CONFIG_KEYS 에 있어야 함.
function sanitizeUpdates(
  updates: Record<string, unknown> | undefined
): Partial<Record<ConfigKey, string>> {
  if (!updates) return {};
  const out: Partial<Record<ConfigKey, string>> = {};
  for (const k of ALL_CONFIG_KEYS) {
    const v = updates[k];
    if (typeof v === "string") {
      const t = v.trim();
      if (t.length > 0) out[k] = t;
    }
  }
  return out;
}

function sanitizeRemove(remove: string[] | undefined): ConfigKey[] {
  if (!Array.isArray(remove)) return [];
  return remove.filter((k): k is ConfigKey =>
    (ALL_CONFIG_KEYS as readonly string[]).includes(k)
  );
}

export async function POST(req: NextRequest) {
  if (!hasEncryptionKey()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "APP_ENCRYPTION_KEY가 설정되지 않아 저장할 수 없습니다. .env.local에 APP_ENCRYPTION_KEY를 추가하고 dev 서버를 재시작하세요.",
      },
      { status: 400 }
    );
  }

  let body: SaveBody;
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청 본문입니다." },
      { status: 400 }
    );
  }

  const updates = sanitizeUpdates(body.updates);
  const remove = sanitizeRemove(body.remove);

  try {
    await saveStoredConfig({ updates, remove });
  } catch (err) {
    const msg = (err as Error).message?.split("\n")[0] ?? "저장 실패";
    return NextResponse.json(
      { ok: false, error: `저장 실패: ${msg}` },
      { status: 500 }
    );
  }

  const status = await getSetupStatus();
  // 저장된 값 원문은 절대 응답에 포함하지 않는다 — status는 마스킹된 뷰.
  return NextResponse.json({ ok: true, status });
}
