/**
 * EmpathySection — "나만 그런 게 아니었구나" 공감 섹션.
 * 문구 수정은 data/challenge.ts 의 `empathy` 를 편집하세요.
 */
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { empathy } from "@/data/challenge";

export function EmpathySection() {
  return (
    <section id="empathy" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow={empathy.eyebrow}
          title={empathy.title}
          description={empathy.description}
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {empathy.points.map((point, index) => (
            <Reveal
              as="li"
              key={point.title}
              delay={index * 0.08}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-muted p-7"
            >
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl bg-surface text-lg ring-1 ring-line"
              >
                {point.emoji}
              </span>
              <h3 className="font-display text-base text-ink sm:text-lg">{point.title}</h3>
              <p className="text-pretty text-sm leading-[1.8] text-ink-muted">{point.body}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.1} className="mt-12 text-center">
          <p className="font-display text-lg text-brand-600 dark:text-brand-300 sm:text-xl">
            {empathy.closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
