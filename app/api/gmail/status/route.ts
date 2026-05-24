import { NextResponse } from "next/server";
import { getConnectedEmail, isGmailConnected } from "@/lib/gmail";
import { loadStoredConfig } from "@/lib/config-store";

export const runtime = "nodejs";

export async function GET() {
  const connected = await isGmailConnected();
  const email = connected ? await getConnectedEmail() : null;
  const env = process.env;
  const stored = await loadStoredConfig();
  const oauthAppConfigured = Boolean(
    (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET) ||
      (stored.GOOGLE_OAUTH_CLIENT_ID && stored.GOOGLE_OAUTH_CLIENT_SECRET)
  );
  return NextResponse.json({ connected, email, oauthAppConfigured });
}
