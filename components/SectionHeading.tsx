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
        <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {eyebrow}
        </span>
      ) : null}

      <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>

      {description ? (
        <p className="text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
