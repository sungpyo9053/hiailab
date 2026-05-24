import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Docker 이미지 크기 최적화 (`.next/standalone` 생성)
  output: "standalone",
};

export default nextConfig;
