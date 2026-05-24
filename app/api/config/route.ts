import { NextResponse } from "next/server";
import { HttpError, requireUser } from "@/lib/current-user";
import { getRuntimeModes } from "@/lib/server-config";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const modes = await getRuntimeModes(user.id);
    return NextResponse.json({
      aiMode: modes.ai,
      emailMode: modes.email,
      kakaoMode: modes.kakao,
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
