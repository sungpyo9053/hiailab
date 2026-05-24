import { NextResponse } from "next/server";
import { loadGlobalConfig } from "@/lib/config-store";
import { HttpError, requireUser } from "@/lib/current-user";
import { getConnectedEmail, isGmailConnected } from "@/lib/gmail";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const connected = await isGmailConnected(user.id);
    const email = connected ? await getConnectedEmail(user.id) : null;
    const env = process.env;
    const g = await loadGlobalConfig();
    const oauthAppConfigured = Boolean(
      (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET) ||
        (g.GOOGLE_OAUTH_CLIENT_ID && g.GOOGLE_OAUTH_CLIENT_SECRET)
    );
    return NextResponse.json({ connected, email, oauthAppConfigured });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
