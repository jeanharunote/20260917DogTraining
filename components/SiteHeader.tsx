"use client";

/** SiteHeader — 상단 고정 헤더. 스크롤하면 배경이 생기고, 앵커 메뉴로 각 섹션에 이동합니다. */
import Link from "next/link";
import { useEffect, useState } from "react";

import { challengeInfo, cta, navLinks } from "@/data/challenge";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-line bg-surface/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          href="#top"
          className={cn(
            "font-display text-sm transition-colors sm:text-base",
            isScrolled ? "text-ink" : "text-white",
          )}
        >
          {challengeInfo.brandName}
        </Link>

        <nav aria-label="페이지 내 메뉴" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                isScrolled
                  ? "text-ink-muted hover:bg-surface-muted hover:text-ink"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href={`#${cta.anchorId}`}
          className="btn-gradient font-display rounded-full px-4 py-2 text-xs transition-all sm:px-5 sm:text-sm"
        >
          신청하기
        </Link>
      </div>
    </header>
  );
}
