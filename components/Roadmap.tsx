"use client";

/**
 * Roadmap — 레벨별 4주 코스. 코스 탭을 누르면 해당 코스의 주차별 훈련이 바뀝니다.
 * 코스 내용 수정은 data/challenge.ts 의 `roadmap.courses` 를 편집하세요.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

import { CtaButton } from "@/components/CtaButton";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { cta, roadmap } from "@/data/challenge";
import { cn } from "@/lib/utils";

export function Roadmap() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeCourse = roadmap.courses[activeIndex];

  /** 좌우 방향키로도 코스를 옮길 수 있게 합니다. (접근성) */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const lastIndex = roadmap.courses.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = activeIndex === lastIndex ? 0 : activeIndex + 1;
    if (event.key === "ArrowLeft") nextIndex = activeIndex === 0 ? lastIndex : activeIndex - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;

    if (nextIndex !== null) {
      event.preventDefault();
      setActiveIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section id="roadmap" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow={roadmap.eyebrow}
          title={roadmap.title}
          description={roadmap.description}
        />

        <Reveal className="mt-14">
          {/* 코스 선택 탭 */}
          <div role="tablist" aria-label="레벨별 코스" className="grid gap-2 sm:grid-cols-3">
            {roadmap.courses.map((course, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={course.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`course-tab-${course.id}`}
                  aria-selected={isActive}
                  aria-controls={`course-panel-${course.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-2xl border px-5 py-4 text-left transition-all duration-200",
                    isActive
                      ? "border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                      : "border-line bg-surface-muted hover:border-brand-200",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isActive ? "text-brand-600 dark:text-brand-300" : "text-ink-muted",
                    )}
                  >
                    {course.label}
                  </span>
                  <span className="font-display text-sm text-ink sm:text-base">
                    {course.keyword}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 난이도 막대 */}
          <div className="mt-6">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-surface-muted ring-1 ring-inset ring-line"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={activeCourse.intensity}
              aria-label={`${activeCourse.label} 코스 난이도`}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                initial={false}
                animate={{ width: `${activeCourse.intensity}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-ink-muted">
              {activeCourse.forWho}
            </p>
          </div>

          {/* 선택된 코스의 주차별 훈련 */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCourse.id}
                id={`course-panel-${activeCourse.id}`}
                role="tabpanel"
                aria-labelledby={`course-tab-${activeCourse.id}`}
                tabIndex={0}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-line bg-surface-muted p-7 sm:p-9"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display rounded-full bg-brand-600 px-3 py-1 text-[11px] font-medium text-white">
                    {activeCourse.label}
                  </span>
                  <span className="font-display text-lg text-ink sm:text-xl">
                    {activeCourse.keyword}
                  </span>
                </div>

                <p className="font-display mt-5 text-base text-brand-600 dark:text-brand-300 sm:text-lg">
                  {activeCourse.target}
                </p>
                <p className="mt-3 text-pretty text-sm leading-[1.8] text-ink-muted sm:text-base">
                  {activeCourse.detail}
                </p>

                {/* 주차별 훈련표 */}
                <ol className="mt-7 flex flex-col gap-2">
                  {activeCourse.weeks.map((week) => (
                    <li
                      key={week.week}
                      className="flex flex-wrap items-center gap-3 rounded-xl bg-surface px-4 py-3"
                    >
                      <span className="font-display shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-300">
                        {week.week}주차
                      </span>
                      <span className="text-sm text-ink">{week.plan}</span>
                    </li>
                  ))}
                </ol>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {activeCourse.tips.map((tip) => (
                    <li
                      key={tip}
                      className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted ring-1 ring-inset ring-line"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* CTA 2/3 */}
        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <CtaButton>{cta.primary}</CtaButton>
        </Reveal>
      </div>
    </section>
  );
}
