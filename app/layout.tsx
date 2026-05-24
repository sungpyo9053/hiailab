import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HI AI LAB",
  description:
    "받은 메일에 정중한 답장을 만들어주는 셀프호스팅 AI 에이전트",
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
