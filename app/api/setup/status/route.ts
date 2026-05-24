import { NextResponse } from "next/server";
import { getSetupStatus } from "@/lib/server-config";

export const runtime = "nodejs";

// 절대 비밀값 원문을 응답에 포함하지 않는다.
// 마스킹 + 모드 정보만 노출.
export async function GET() {
  const status = await getSetupStatus();
  return NextResponse.json(status);
}
