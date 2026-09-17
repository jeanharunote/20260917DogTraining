/** layout.tsx — 모든 페이지를 감싸는 기본 틀과 메타 정보(브라우저 탭 제목 등)를 정의합니다. */
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_KR, Noto_Sans_KR } from "next/font/google";

import { siteMeta } from "@/data/challenge";

import "./globals.css";

/**
 * 글꼴 설정
 * - IBM Plex Sans KR: 제목·버튼용. 획이 정돈되어 있어 단정하고 세련된 인상을 줍니다.
 * - Noto Sans KR: 본문용. 길게 읽어도 편한 가독성.
 *
 * TODO: 글꼴을 바꾸고 싶다면 아래 import 의 이름만 다른 Google Fonts 한글 글꼴로 교체하세요.
 *       (세련된 계열 예시: Gowun_Dodum, Hahmlet / 부드러운 계열 예시: Jua, Do_Hyeon)
 *       한글 글꼴은 용량이 커서 preload: false 로 두는 것이 권장됩니다.
 */
const display = IBM_Plex_Sans_KR({
  weight: ["500", "600", "700"],
  variable: "--font-display-family",
  display: "swap",
  preload: false,
});

const body = Noto_Sans_KR({
  weight: ["300", "400", "500", "700"],
  variable: "--font-body-family",
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
    { media: "(prefers-color-scheme: dark)", color: "#121019" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${display.variable} ${body.variable}`}>
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
