import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HI AI LAB — 필요한 AI 에이전트를 골라 켜는 자동화 허브",
  description:
    "메일, 일정, 문서, 알림, 리포트, 데이터 정리까지. 반복 업무를 에이전트 단위로 선택하고 실행하는 개인 자동화 허브. 모든 처리는 사용자의 실행 환경에서.",
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
