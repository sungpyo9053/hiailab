import { NextResponse } from "next/server";
import { getRuntimeModes } from "@/lib/server-config";

export const runtime = "nodejs";

// 프론트엔드에 실행 모드만 노출. 환경변수/저장값 자체는 응답에 포함하지 않는다.
export async function GET() {
  const modes = await getRuntimeModes();
  return NextResponse.json({
    aiMode: modes.ai,
    emailMode: modes.email,
    kakaoMode: modes.kakao,
  });
}
