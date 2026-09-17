"use client";

/**
 * FAQ — 초보자가 가장 걱정하는 질문을 모은 아코디언입니다.
 * 질문/답변 수정은 data/challenge.ts 의 `faq.items` 를 편집하세요.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { faq } from "@/data/challenge";
import { cn } from "@/lib/utils";

export function FAQ() {
  // 첫 번째 질문은 열어둔 채로 시작합니다.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow={faq.eyebrow} title={faq.title} />

        <ul className="mt-12 flex flex-col gap-3">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <Reveal
                as="li"
                key={item.question}
                delay={index * 0.05}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-muted"
                  >
                    <span className="font-display text-sm text-ink sm:text-base">{item.question}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 transition-transform duration-300 dark:bg-brand-900/40 dark:text-brand-300",
                        isOpen && "rotate-45",
                      )}
                    >
                      +
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-pretty px-6 pb-6 text-sm leading-relaxed text-ink-muted">
                        {item.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
