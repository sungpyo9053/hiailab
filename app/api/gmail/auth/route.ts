import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/gmail";

export const runtime = "nodejs";

// 인증 없이 호출 가능 — saas 모드의 "로그인 시작" 엔드포인트이기도 함.
export async function GET() {
  const url = await buildAuthorizeUrl(randomBytes(16).toString("hex"));
  if (!url) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Google OAuth 앱이 설정되지 않았습니다. (관리자가 /setup 에서 GOOGLE_OAUTH_CLIENT_ID/SECRET 저장 필요)",
      },
      { status: 400 }
    );
  }
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
