/** layout.tsx — 모든 페이지를 감싸는 기본 틀과 메타 정보(브라우저 탭 제목 등)를 정의합니다. */
import type { Metadata, Viewport } from "next";
import { Jua, Noto_Sans_KR } from "next/font/google";

import { siteMeta } from "@/data/challenge";

import "./globals.css";

/**
 * 글꼴 설정
 * - Jua: 둥글고 귀여운 느낌의 제목/버튼용 글꼴
 * - Noto Sans KR: 길게 읽어도 편한 깔끔한 본문용 글꼴
 *
 * TODO: 글꼴을 바꾸고 싶다면 아래 import 의 이름만 다른 Google Fonts 한글 글꼴로 교체하세요.
 *       (귀여운 계열 예시: Gaegu, Dongle, Do_Hyeon / 깔끔한 계열 예시: Gowun_Dodum, IBM_Plex_Sans_KR)
 *       한글 글꼴은 용량이 커서 preload: false 로 두는 것이 권장됩니다.
 */
const jua = Jua({
  weight: "400",
  variable: "--font-jua",
  display: "swap",
  preload: false,
});

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: siteMeta.title,
  description: siteMeta.description,
  metadataBase: new URL(siteMeta.url),
  openGraph: {
    title: siteMeta.title,
    description: siteMeta.description,
    url: siteMeta.url,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: siteMeta.title,
    description: siteMeta.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#100c16" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${jua.variable} ${notoSansKr.variable}`}>
      <body className="font-sans antialiased">
        {/* 키보드/스크린리더 사용자가 본문으로 바로 이동할 수 있는 링크 (접근성) */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
