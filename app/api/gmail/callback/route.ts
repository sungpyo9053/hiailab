import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/gmail";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (error) {
    return NextResponse.redirect(`${appUrl}/agent?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/agent?error=missing_code`);
  }

  const jar = await cookies();
  const stored = jar.get("hiailab_oauth_state")?.value;
  if (!stored || stored !== state) {
    return NextResponse.redirect(`${appUrl}/agent?error=state_mismatch`);
  }
  jar.delete("hiailab_oauth_state");

  const tokens = await exchangeCodeForTokens(code);
  if (!tokens) {
    return NextResponse.redirect(`${appUrl}/agent?error=token_exchange_failed`);
  }

  // OWNER_EMAIL 이 설정되어 있으면, 그 이메일로 로그인한 경우만 허용.
  // 다른 이메일로 OAuth 통과한 경우 즉시 연결 해제 + 안내.
  const owner = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
  if (owner && tokens.email && tokens.email.toLowerCase() !== owner) {
    const { disconnectGmail } = await import("@/lib/gmail");
    await disconnectGmail();
    return NextResponse.redirect(
      `${appUrl}/agent?error=${encodeURIComponent("not_owner")}`
    );
  }

  return NextResponse.redirect(`${appUrl}/agent?connected=1`);
}
