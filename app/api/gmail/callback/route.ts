import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/gmail";
import { disconnectGmail } from "@/lib/gmail";
import { getAppMode, isAdmin, getOwnerEmail } from "@/lib/mode";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

// OAuth 콜백 — saas 모드에서는 이게 로그인 흐름 (cookie 발급).
// self 모드는 단일 사용자라 cookie 없이 _self 에 토큰 저장.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (error) {
    return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/?error=missing_code`);
  }

  const jar = await cookies();
  const stored = jar.get("hiailab_oauth_state")?.value;
  if (!stored || stored !== state) {
    return NextResponse.redirect(`${appUrl}/?error=state_mismatch`);
  }
  jar.delete("hiailab_oauth_state");

  const mode = getAppMode();
  // self 모드는 _self 에 저장, saas 는 응답 email 에 저장
  const userIdHint = mode === "self" ? "_self" : null;
  const tokens = await exchangeCodeForTokens(code, userIdHint);
  if (!tokens) {
    return NextResponse.redirect(`${appUrl}/?error=token_exchange_failed`);
  }

  if (mode === "self") {
    // OWNER_EMAIL 검증
    const owner = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
    if (owner && tokens.email && tokens.email.toLowerCase() !== owner) {
      await disconnectGmail("_self");
      return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent("not_owner")}`);
    }
    return NextResponse.redirect(`${appUrl}/?connected=1`);
  }

  // saas — cookie session 발급
  if (!tokens.email) {
    return NextResponse.redirect(`${appUrl}/?error=no_email`);
  }
  const role = isAdmin(tokens.email) || !getOwnerEmail() ? "admin" : "user";
  // OWNER_EMAIL 미설정이면 첫 가입자 또는 모두 admin? 안전: OWNER_EMAIL 없으면 모두 user.
  // 위 표현은 잘못 — 다시:
  const finalRole = isAdmin(tokens.email) ? "admin" : "user";
  await setSessionCookie(tokens.email, finalRole);
  return NextResponse.redirect(`${appUrl}/?connected=1`);
}
