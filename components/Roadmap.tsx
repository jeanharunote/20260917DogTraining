"use client";

/**
 * Roadmap — 4주 습관 로드맵. 주차 탭을 누르면 해당 주차의 목표가 바뀌는 인터랙티브 타임라인입니다.
 * 주차별 내용 수정은 data/challenge.ts 의 `roadmap.weeks` 를 편집하세요.
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
  const activeWeek = roadmap.weeks[activeIndex];

  /** 좌우 방향키로도 주차를 옮길 수 있게 합니다. (접근성) */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const lastIndex = roadmap.weeks.length - 1;
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
          {/* 주차 선택 탭 */}
          <div
            role="tablist"
            aria-label="주차별 목표"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {roadmap.weeks.map((week, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={week.week}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`roadmap-tab-${week.week}`}
                  aria-selected={isActive}
                  aria-controls={`roadmap-panel-${week.week}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                    isActive
                      ? "border-brand-500 bg-brand-50 shadow-sm dark:bg-brand-900/30"
                      : "border-line bg-surface-muted hover:border-brand-300",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isActive ? "text-brand-600 dark:text-brand-300" : "text-ink-muted",
                    )}
                  >
                    {week.label}
                  </span>
                  <span className="font-display text-sm text-ink sm:text-base">{week.keyword}</span>
                </button>
              );
            })}
          </div>

          {/* 전체 진행 정도 막대 */}
          <div className="mt-6">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-surface-muted ring-1 ring-inset ring-line"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={activeWeek.intensity}
              aria-label={`${activeWeek.label} 운동 강도`}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-500"
                initial={false}
                animate={{ width: `${activeWeek.intensity}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-ink-muted">
              천천히 올라갑니다 · 현재 강도 {activeWeek.intensity}%
            </p>
          </div>

          {/* 선택된 주차의 상세 내용 */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWeek.week}
                id={`roadmap-panel-${activeWeek.week}`}
                role="tabpanel"
                aria-labelledby={`roadmap-tab-${activeWeek.week}`}
                tabIndex={0}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl border border-line bg-surface-muted p-7 sm:p-9"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="btn-gradient font-display rounded-full px-3 py-1 text-xs">
                    {activeWeek.label}
                  </span>
                  <span className="font-display text-lg text-ink sm:text-xl">
                    {activeWeek.keyword}
                  </span>
                </div>

                <p className="font-display mt-5 text-base text-brand-700 dark:text-brand-300 sm:text-lg">
                  {activeWeek.goal}
                </p>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
                  {activeWeek.detail}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {activeWeek.tips.map((tip) => (
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
