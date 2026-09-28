"use client";

/** AppHeader — 로그인 후 페이지의 상단 메뉴. 참가자·관리자 여부에 따라 메뉴가 달라집니다. */
import Link from "next/link";
import { usePathname } from "next/navigation";

import { challengeInfo } from "@/data/challenge";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { user, isAdmin, isParticipant, signOut } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: "/me", label: "마이페이지", show: Boolean(user) },
    { href: "/feed", label: "함께 달리기", show: isParticipant || isAdmin },
    { href: "/admin", label: "관리자", show: isAdmin },
  ].filter((link) => link.show);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-5">
        <Link href="/" className="font-display text-sm font-semibold text-ink">
          {challengeInfo.brandName}
        </Link>

        <nav aria-label="내 메뉴" className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                pathname === link.href
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="ml-1 rounded-full px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink sm:text-sm"
            >
              로그아웃
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
