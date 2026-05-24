import { NextResponse } from "next/server";
import { HttpError, requireUser } from "@/lib/current-user";
import { getSetupStatus } from "@/lib/server-config";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const status = await getSetupStatus(user.id);
    return NextResponse.json(status);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
