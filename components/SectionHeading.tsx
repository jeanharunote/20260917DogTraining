/** SectionHeading — 각 섹션 상단의 "작은 라벨 + 큰 제목 + 설명" 묶음을 통일된 모양으로 보여줍니다. */
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** 가운데 정렬 여부 */
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center rounded-full border border-line px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-brand-600 dark:text-brand-300">
          {eyebrow}
        </span>
      ) : null}

      <h2 className="font-display text-balance text-[1.7rem] font-bold leading-[1.35] text-ink sm:text-[2.1rem]">
        {title}
      </h2>

      {description ? (
        <p className="text-pretty text-[0.95rem] leading-[1.8] text-ink-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
