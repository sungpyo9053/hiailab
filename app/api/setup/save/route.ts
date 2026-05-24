import { NextRequest, NextResponse } from "next/server";
import {
  ALL_GLOBAL_CONFIG_KEYS,
  ALL_USER_CONFIG_KEYS,
  type GlobalConfigKey,
  type UserConfigKey,
  saveGlobalConfig,
  saveUserConfig,
} from "@/lib/config-store";
import { hasEncryptionKey } from "@/lib/crypto";
import { HttpError, requireUser } from "@/lib/current-user";
import { getSetupStatus } from "@/lib/server-config";

export const runtime = "nodejs";

type SaveBody = {
  updates?: Record<string, unknown>;
  remove?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    if (!hasEncryptionKey()) {
      return NextResponse.json(
        {
          ok: false,
          error: "APP_ENCRYPTION_KEY가 설정되지 않아 저장할 수 없습니다.",
        },
        { status: 400 }
      );
    }

    let body: SaveBody;
    try {
      body = (await req.json()) as SaveBody;
    } catch {
      return NextResponse.json({ ok: false, error: "잘못된 요청 본문입니다." }, { status: 400 });
    }

    // updates 분류 — global vs user. global 은 admin 만 변경 가능 (saas)
    const globalUpdates: Partial<Record<GlobalConfigKey, string>> = {};
    const userUpdates: Partial<Record<UserConfigKey, string>> = {};
    const globalRemove: GlobalConfigKey[] = [];
    const userRemove: UserConfigKey[] = [];

    if (body.updates) {
      for (const [k, v] of Object.entries(body.updates)) {
        if (typeof v !== "string") continue;
        const t = v.trim();
        if (t.length === 0) continue;
        if (ALL_GLOBAL_CONFIG_KEYS.includes(k as GlobalConfigKey)) {
          globalUpdates[k as GlobalConfigKey] = t;
        } else if (ALL_USER_CONFIG_KEYS.includes(k as UserConfigKey)) {
          userUpdates[k as UserConfigKey] = t;
        }
      }
    }
    if (Array.isArray(body.remove)) {
      for (const k of body.remove) {
        if (ALL_GLOBAL_CONFIG_KEYS.includes(k as GlobalConfigKey)) {
          globalRemove.push(k as GlobalConfigKey);
        } else if (ALL_USER_CONFIG_KEYS.includes(k as UserConfigKey)) {
          userRemove.push(k as UserConfigKey);
        }
      }
    }

    // saas 에서는 global 변경은 admin 만
    if (user.mode === "saas" && user.role !== "admin") {
      const touchedGlobal = Object.keys(globalUpdates).length > 0 || globalRemove.length > 0;
      if (touchedGlobal) {
        return NextResponse.json(
          { ok: false, error: "전역 키(LLM/Google OAuth 앱)는 관리자만 변경 가능합니다." },
          { status: 403 }
        );
      }
    }

    try {
      if (Object.keys(globalUpdates).length > 0 || globalRemove.length > 0) {
        await saveGlobalConfig({ updates: globalUpdates, remove: globalRemove });
      }
      if (Object.keys(userUpdates).length > 0 || userRemove.length > 0) {
        await saveUserConfig(user.id, { updates: userUpdates, remove: userRemove });
      }
    } catch (err) {
      const msg = (err as Error).message?.split("\n")[0] ?? "저장 실패";
      return NextResponse.json({ ok: false, error: `저장 실패: ${msg}` }, { status: 500 });
    }

    const status = await getSetupStatus(user.id);
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
