import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSmtpConfig } from "@/lib/server-config";

export const runtime = "nodejs";

type TestSmtpBody = { to?: string };

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  let body: TestSmtpBody = {};
  try {
    body = (await req.json()) as TestSmtpBody;
  } catch {
    // 본문 없어도 OK
  }

  const smtp = await getSmtpConfig();
  if (!smtp) {
    return NextResponse.json({
      ok: true,
      mode: "mock",
      message:
        "SMTP가 설정되지 않아 MOCK 모드입니다. 실제 이메일은 발송되지 않았습니다.",
    });
  }

  const to = (body.to && body.to.trim()) || smtp.defaultTo || "";
  if (!to || !isLikelyEmail(to)) {
    return NextResponse.json(
      {
        ok: false,
        mode: "real",
        error:
          "테스트 수신 이메일이 비어 있거나 형식이 올바르지 않습니다. DEFAULT_TO_EMAIL을 설정하거나 요청 본문에 to를 넣으세요.",
      },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  try {
    await transporter.sendMail({
      from: `"HiaiLab" <${smtp.user}>`,
      to,
      subject: "[HiaiLab] SMTP 연결 테스트",
      text:
        "이 메일이 보이면 HiaiLab의 SMTP 설정이 정상 동작합니다.\n\n" +
        "이 메일은 /setup 페이지의 '연결 테스트' 버튼으로 발송되었습니다.",
    });
    return NextResponse.json({
      ok: true,
      mode: "real",
      message: "테스트 메일을 발송했습니다. 받은편지함을 확인하세요.",
    });
  } catch (err) {
    const safe = (err as Error).message?.split("\n")[0] ?? "전송 실패";
    return NextResponse.json(
      { ok: false, mode: "real", error: `SMTP 전송 실패: ${safe}` },
      { status: 502 }
    );
  }
}
