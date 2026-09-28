/** ui.tsx — 로그인 후 페이지들에서 함께 쓰는 작은 화면 조각들입니다. */
import type { EnrollmentStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      {description ? (
        <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-muted">{description}</p>
      ) : null}
    </header>
  );
}

export function Card({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section className={cn("card-soft rounded-2xl border border-line bg-surface p-6 sm:p-7", className)}>
      {title ? <h2 className="font-display mb-4 text-base text-ink">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Spinner({ label = "불러오는 중..." }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-sm text-ink-muted">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
      />
      {label}
    </div>
  );
}

const statusStyle: Record<EnrollmentStatus, { label: string; className: string }> = {
  pending: {
    label: "입금 대기",
    className: "bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300",
  },
  paid: {
    label: "참가 확정",
    className: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
  },
  refunded: { label: "환불 완료", className: "bg-surface-muted text-ink-muted ring-1 ring-line" },
  cancelled: { label: "취소", className: "bg-surface-muted text-ink-muted ring-1 ring-line" },
};

export function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const style = statusStyle[status];

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", style.className)}>
      {style.label}
    </span>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-4 py-3 text-sm leading-relaxed",
        tone === "error" &&
          "border border-accent-300 bg-accent-100 text-accent-600 dark:border-accent-500/40 dark:bg-accent-500/10 dark:text-accent-300",
        tone === "success" && "bg-brand-50 text-brand-700 dark:bg-brand-900/25 dark:text-brand-200",
        tone === "info" && "bg-surface-muted text-ink-muted ring-1 ring-line",
      )}
    >
      {children}
    </div>
  );
}

export const primaryButton =
  "btn-gradient font-display inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand-300 disabled:cursor-not-allowed disabled:opacity-60";

export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 transition-colors focus:border-brand-400";

/** 코스 값 → 화면 표시 이름 */
export const courseLabel: Record<string, string> = {
  beginner: "입문",
  "ten-k": "10K 도전",
  half: "하프 도전",
};
