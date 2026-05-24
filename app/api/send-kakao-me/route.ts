import { NextRequest, NextResponse } from "next/server";
import { getKakaoAccessToken } from "@/lib/server-config";

export const runtime = "nodejs";

type SendKakaoBody = {
  title?: string;
  content?: string;
  linkUrl?: string;
};

const KAKAO_ME_ENDPOINT =
  "https://kapi.kakao.com/v2/api/talk/memo/default/send";

const MAX_LEN = 500;

function truncateForKakao(title: string, content: string, fallbackUrl: string) {
  const header = `${title}\n\n`;
  const tail = `\n\n웹에서 전체 결과 확인: ${fallbackUrl}`;
  const budget = MAX_LEN - header.length;

  if (content.length <= budget) {
    return header + content;
  }
  const room = Math.max(0, budget - tail.length);
  return header + content.slice(0, room) + tail;
}

export async function POST(req: NextRequest) {
  let body: SendKakaoBody;
  try {
    body = (await req.json()) as SendKakaoBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "잘못된 요청 본문입니다." },
      { status: 400 }
    );
  }

  const content = body.content ?? "";
  if (!content.trim()) {
    return NextResponse.json(
      { ok: false, error: "본문 내용이 비어 있습니다." },
      { status: 400 }
    );
  }

  const token = await getKakaoAccessToken();

  // === MOCK 모드 ===
  if (!token) {
    return NextResponse.json({
      ok: true,
      mode: "mock",
      message:
        "카카오톡 전송 완료 MOCK — 실제 카카오톡은 발송되지 않았습니다. KAKAO_ACCESS_TOKEN을 추가하면 실제 전송됩니다.",
    });
  }

  // === REAL 모드 ===
  const title = body.title?.trim() || "[HI AI LAB] AI 결과 도착";
  const linkUrl =
    body.linkUrl?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const text = truncateForKakao(title, content, linkUrl);

  const template = {
    object_type: "text",
    text,
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
      const status = resp.status;
      let kakaoMsg = "";
      try {
        const data = (await resp.json()) as { msg?: string };
        kakaoMsg = data.msg ?? "";
      } catch {
        // ignore
      }
      console.error("[send-kakao-me] 응답 실패", { status });
      return NextResponse.json(
        {
          ok: false,
          mode: "real",
          error:
            `카카오 전송 실패 (status ${status})` +
            (kakaoMsg ? `: ${kakaoMsg}` : ""),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "real",
      message: "카카오톡으로 전송 완료",
    });
  } catch (err) {
    const safeMsg = (err as Error).message?.split("\n")[0] ?? "카카오 전송 실패";
    console.error("[send-kakao-me] 예외 발생", { message: safeMsg });
    return NextResponse.json(
      { ok: false, mode: "real", error: `카카오 전송 실패: ${safeMsg}` },
      { status: 500 }
    );
  }
}
