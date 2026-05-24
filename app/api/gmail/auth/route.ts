import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/gmail";

export const runtime = "nodejs";

export async function GET() {
  const url = await buildAuthorizeUrl(randomBytes(16).toString("hex"));
  if (!url) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Google OAuth 앱이 설정되지 않았습니다. /setup에서 GOOGLE_OAUTH_CLIENT_ID/SECRET을 먼저 저장하세요.",
      },
      { status: 400 }
    );
  }
  // state 검증을 위해 cookie 저장
  const state = new URL(url).searchParams.get("state")!;
  const jar = await cookies();
  jar.set("hiailab_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(url);
}
