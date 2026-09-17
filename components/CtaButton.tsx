/**
 * CtaButton — 페이지 전체에서 반복 사용하는 신청 유도 버튼입니다.
 * 기본 동작은 신청 폼 섹션(#signup)으로 부드럽게 이동하는 것입니다.
 */
import Link from "next/link";

import { cn } from "@/lib/utils";

type CtaButtonProps = {
  children: React.ReactNode;
  /** 이동할 위치. 기본값은 신청 폼 섹션입니다. */
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  /** 스크린리더 사용자를 위한 추가 설명 */
  ariaLabel?: string;
};

const variantStyles: Record<NonNullable<CtaButtonProps["variant"]>, string> = {
  primary:
    "btn-gradient shadow-lg shadow-brand-600/30 hover:shadow-brand-700/40 active:scale-[0.98]",
  secondary:
    "bg-surface-raised text-ink border border-line hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-300 active:scale-[0.98]",
  ghost: "bg-white/10 text-white backdrop-blur border border-white/30 hover:bg-white/20",
};

const sizeStyles: Record<NonNullable<CtaButtonProps["size"]>, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function CtaButton({
  children,
  href = "#signup",
  variant = "primary",
  size = "lg",
  className,
  ariaLabel,
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "font-display inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}
