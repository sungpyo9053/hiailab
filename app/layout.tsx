import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오토벤딩",
  description: "필요한 AI 자동화를 자판기처럼 바로 뽑아 쓰는 서비스",
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
