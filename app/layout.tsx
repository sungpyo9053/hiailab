import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HIAI — Hi AI. Bye 반복업무.",
  description:
    "필요한 AI 에이전트를 골라 켜고, 매일 반복되는 일을 하나씩 떠나보내세요. 메일, 일정, 문서, 알림, 리포트까지 — 내 삶에서 없애고 싶은 일을 에이전트로 자동화합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
