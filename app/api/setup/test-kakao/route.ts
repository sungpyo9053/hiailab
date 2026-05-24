import { NextResponse } from "next/server";
import { HttpError, requireUser } from "@/lib/current-user";
import { getKakaoAccessToken } from "@/lib/server-config";

export const runtime = "nodejs";

const KAKAO_ME_ENDPOINT = "https://kapi.kakao.com/v2/api/talk/memo/default/send";

export async function POST() {
  try {
    const user = await requireUser();
    const token = await getKakaoAccessToken(user.id);
    if (!token) {
      return NextResponse.json({
        ok: true,
        mode: "mock",
        message: "KAKAO_ACCESS_TOKEN이 설정되지 않아 MOCK 모드입니다. 실제 카카오톡은 발송되지 않았습니다.",
      });
    }
    const linkUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const template = {
      object_type: "text",
      text:
        "[HI AI LAB] 카카오 연결 테스트\n\n이 메시지가 보이면 카카오 액세스 토큰이 정상 동작합니다.",
      link: { web_url: linkUrl, mobile_web_url: linkUrl },
      button_title: "웹에서 보기",
    };
    try {
      const form = new URLSearchParams();
      form.set("template_object", JSON.stringify(template));
      const resp = await fetch(KAKAO_ME_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });
      if (!resp.ok) {
        let kakaoMsg = "";
        try {
          const data = (await resp.json()) as { msg?: string };
          kakaoMsg = data.msg ?? "";
        } catch {
          // ignore
        }
        return NextResponse.json(
          {
            ok: false,
            mode: "real",
            error: `카카오 응답 실패 (status ${resp.status})${kakaoMsg ? `: ${kakaoMsg}` : ""}`,
          },
          { status: 502 }
        );
      }
      return NextResponse.json({
        ok: true,
        mode: "real",
        message: "카카오 테스트 메시지를 발송했습니다. '나와의 채팅'을 확인하세요.",
      });
    } catch (err) {
      const safe = (err as Error).message?.split("\n")[0] ?? "전송 실패";
      return NextResponse.json(
        { ok: false, mode: "real", error: `카카오 전송 실패: ${safe}` },
        { status: 500 }
      );
    }
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
