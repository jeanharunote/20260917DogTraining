import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 모든 페이지를 미리 HTML 로 만들어 out/ 폴더에 내보냅니다. (서버 없이 동작하는 정적 사이트)
  // 덕분에 Cloudflare Pages 같은 무료 정적 호스팅에 그대로 올릴 수 있습니다.
  // 로그인·신청·인증은 브라우저에서 Firebase 와 직접 통신하므로 서버가 필요 없습니다.
  output: "export",
};

export default nextConfig;
