import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { verifyPassword } from "@/lib/users-db";

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

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "이메일과 비밀번호를 모두 입력해주세요." },
      { status: 400 }
    );
  }
  const r = await verifyPassword(email, password);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 401 });
  }
  await setSessionCookie(r.user.email, r.user.role);
  return NextResponse.json({
    ok: true,
    user: { email: r.user.email, role: r.user.role },
  });
}
