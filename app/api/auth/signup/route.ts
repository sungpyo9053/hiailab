import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/users-db";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

type Body = { email?: string; password?: string };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  const r = await createUser({ email, password });
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
  }
  await setSessionCookie(r.user.email, r.user.role);
  return NextResponse.json({
    ok: true,
    user: { email: r.user.email, role: r.user.role },
  });
}
