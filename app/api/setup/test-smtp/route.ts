import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { HttpError, requireUser } from "@/lib/current-user";
import { getSmtpConfig } from "@/lib/server-config";

export const runtime = "nodejs";

type Body = { to?: string };

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    let body: Body = {};
    try {
      body = (await req.json()) as Body;
    } catch {
      // ignore
    }
    const smtp = await getSmtpConfig(user.id);
    if (!smtp) {
      return NextResponse.json({
        ok: true,
        mode: "mock",
        message: "SMTP가 설정되지 않아 MOCK 모드입니다. 실제 이메일은 발송되지 않았습니다.",
      });
    }
    const to = (body.to && body.to.trim()) || smtp.defaultTo || "";
    if (!to || !isLikelyEmail(to)) {
      return NextResponse.json(
        { ok: false, mode: "real", error: "테스트 수신 이메일이 비어 있거나 형식이 올바르지 않습니다." },
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
        subject: "[HI AI LAB] SMTP 연결 테스트",
        text: "이 메일이 보이면 HI AI LAB의 SMTP 설정이 정상 동작합니다.",
      });
      return NextResponse.json({
        ok: true,
        mode: "real",
        message: "테스트 메일을 발송했습니다. 받은편지함을 확인하세요.",
      });
    } catch (err) {
      const safe = (err as Error).message?.split("\n")[0] ?? "전송 실패";
      console.error("[test-smtp] 실패", { message: safe });
      return NextResponse.json({ ok: false, mode: "real", error: `SMTP 전송 실패: ${safe}` }, { status: 502 });
    }
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    throw e;
  }
}
