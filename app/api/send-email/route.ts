import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSmtpConfig } from "@/lib/server-config";

export const runtime = "nodejs";

type SendEmailBody = {
  to?: string;
  subject?: string;
  content?: string;
};

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  let body: SendEmailBody;
  try {
    body = (await req.json()) as SendEmailBody;
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

  const smtp = await getSmtpConfig();

  // === MOCK 모드 ===
  if (!smtp) {
    return NextResponse.json({
      ok: true,
      mode: "mock",
      message:
        "이메일 전송 완료 MOCK — 실제 이메일은 발송되지 않았습니다. SMTP 설정을 추가하면 실제 전송됩니다.",
    });
  }

  // === REAL 모드 ===
  const subject = body.subject?.trim() || "[HI AI LAB] AI 결과";
  const to = (body.to && body.to.trim()) || smtp.defaultTo || "";

  if (!to || !isLikelyEmail(to)) {
    return NextResponse.json(
      { ok: false, error: "수신 이메일이 비어 있거나 형식이 올바르지 않습니다." },
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
      from: `"HI AI LAB" <${smtp.user}>`,
      to,
      subject,
      text: content,
    });
    return NextResponse.json({
      ok: true,
      mode: "real",
      message: "이메일로 전송 완료",
    });
  } catch (err) {
    const safeMsg = (err as Error).message?.split("\n")[0] ?? "이메일 전송 실패";
    console.error("[send-email] 전송 실패", { message: safeMsg });
    return NextResponse.json(
      { ok: false, mode: "real", error: `이메일 전송 실패: ${safeMsg}` },
      { status: 502 }
    );
  }
}
