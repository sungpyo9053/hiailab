import { NextResponse } from "next/server";
import { HttpError, requireUser } from "@/lib/current-user";
import { disconnectGmail } from "@/lib/gmail";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await requireUser();
    await disconnectGmail(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
