/**
 * HabitSystem — 습관을 지켜주는 장치(혜택/리워드)와 신뢰 통계 카드를 보여줍니다.
 * 문구/수치 수정은 data/challenge.ts 의 `habitSystem` 을 편집하세요.
 */
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { habitSystem } from "@/data/challenge";

export function HabitSystem() {
  return (
    <section id="system" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow={habitSystem.eyebrow}
          title={habitSystem.title}
          description={habitSystem.description}
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {habitSystem.features.map((feature, index) => (
            <Reveal
              as="li"
              key={feature.title}
              delay={index * 0.07}
              className="flex gap-5 rounded-3xl bg-surface p-7 shadow-sm ring-1 ring-line"
            >
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-2xl dark:bg-accent-500/15"
              >
                {feature.emoji}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-base text-ink sm:text-lg">{feature.title}</h3>
                <p className="text-pretty text-sm leading-relaxed text-ink-muted">{feature.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        {/* 신뢰 통계 — TODO: data/challenge.ts 의 habitSystem.stats 를 실제 수치로 교체하세요 */}
        <Reveal delay={0.1} className="mt-8">
          <dl className="grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-2 lg:grid-cols-4">
            {habitSystem.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 bg-surface px-6 py-8 text-center">
                <dt className="order-2 text-sm font-medium text-ink-muted">{stat.label}</dt>
                <dd className="font-display tabular order-1 bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-3xl text-transparent dark:from-brand-400 dark:to-accent-400">
                  {stat.value}
                </dd>
                <p className="order-3 text-[11px] text-ink-muted/70">{stat.caption}</p>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
