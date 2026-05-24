import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getAppMode } from "@/lib/mode";

export const runtime = "nodejs";

// 현재 로그인 상태 (cookie 사용자). 미로그인이면 user: null 반환.
export async function GET() {
  const mode = getAppMode();
  const user = await getCurrentUser();
  return NextResponse.json({ mode, user });
}
