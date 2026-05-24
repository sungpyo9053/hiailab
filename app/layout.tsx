import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HI AI LAB · 자판기처럼 골라 쓰는 AI 자동화",
  description:
    "본인 Gmail을 연결하고 자동화 에이전트를 활성화하세요. 본인 계정 안에서만 동작합니다.",
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
