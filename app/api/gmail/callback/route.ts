import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { exchangeCodeForTokens, disconnectGmail } from "@/lib/gmail";
import { getAppMode } from "@/lib/mode";

export const runtime = "nodejs";

// OAuth 콜백 — Gmail 연결을 현재 로그인된 사용자의 디렉토리에 저장.
// self 모드: _self
// saas 모드: cookie 사용자 (로그인 안 됐으면 에러)
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

  if (mode === "self") {
    // self 모드 — _self 에 저장
    const tokens = await exchangeCodeForTokens(code, "_self");
    if (!tokens) {
      return NextResponse.redirect(`${appUrl}/?error=token_exchange_failed`);
    }
    const owner = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
    if (owner && tokens.email && tokens.email.toLowerCase() !== owner) {
      await disconnectGmail("_self");
      return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent("not_owner")}`);
    }
    return NextResponse.redirect(`${appUrl}/?gmail_connected=1`);
  }

  // saas 모드 — 반드시 로그인된 상태여야 함
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent("Gmail 연결은 로그인 후 가능합니다.")}`);
  }

  const tokens = await exchangeCodeForTokens(code, user.id);
  if (!tokens) {
    return NextResponse.redirect(`${appUrl}/?error=token_exchange_failed`);
  }
  return NextResponse.redirect(`${appUrl}/?gmail_connected=1`);
}
