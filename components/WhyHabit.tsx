/**
 * WhyHabit — 습관이 안 만들어지는 이유(원리)와 이 챌린지의 해결 장치를 소개합니다.
 * 문구 수정은 data/challenge.ts 의 `whyHabit` 을 편집하세요.
 */
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { whyHabit } from "@/data/challenge";

export function WhyHabit() {
  return (
    <section id="why-habit" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow={whyHabit.eyebrow}
          title={whyHabit.title}
          description={whyHabit.description}
        />

        {/* 습관 형성 원리 — 신뢰 요소 */}
        <ul className="mt-14 grid gap-5 sm:grid-cols-3">
          {whyHabit.principles.map((principle, index) => (
            <Reveal
              as="li"
              key={principle.title}
              delay={index * 0.08}
              className="flex flex-col gap-3 rounded-2xl bg-surface p-7 card-soft ring-1 ring-line"
            >
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-lg ring-1 ring-line dark:bg-brand-900/30"
              >
                {principle.emoji}
              </span>
              <h3 className="font-display text-lg text-ink">{principle.title}</h3>
              <p className="text-pretty text-sm leading-relaxed text-ink-muted">{principle.body}</p>
            </Reveal>
          ))}
        </ul>

        {/* 해결책 — "이 챌린지는 이렇게 습관을 만듭니다" */}
        <div className="mt-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h3 className="font-display text-balance text-2xl leading-snug text-ink sm:text-3xl">
              {whyHabit.solutionTitle}
            </h3>
          </Reveal>

          <ol className="mt-10 grid gap-5 sm:grid-cols-2">
            {whyHabit.solutions.map((solution, index) => (
              <Reveal
                as="li"
                key={solution.step}
                delay={index * 0.07}
                className="flex gap-5 rounded-2xl border border-line bg-surface p-7"
              >
                <span
                  aria-hidden="true"
                  className="font-display tabular shrink-0 text-lg text-brand-400"
                >
                  {solution.step}
                </span>
                <div className="flex flex-col gap-2">
                  <h4 className="font-display text-base text-ink sm:text-lg">{solution.title}</h4>
                  <p className="text-pretty text-sm leading-relaxed text-ink-muted">
                    {solution.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
