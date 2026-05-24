import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HI AI LAB — 개인 업무 자동화를 위한 AI Agent Hub",
  description:
    "메일, 일정, 문서, 알림을 연결하고 반복 업무를 자동으로 분류·요약·초안 작성까지 처리하는 AI Agent Hub. 모든 처리는 사용자의 실행 환경에서.",
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
