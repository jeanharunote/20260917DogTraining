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
              className="flex gap-5 rounded-2xl bg-surface p-7 card-soft ring-1 ring-line"
            >
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-lg ring-1 ring-line dark:bg-accent-500/10"
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
          <dl className="grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-4">
            {habitSystem.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 bg-surface px-6 py-8 text-center">
                <dt className="order-2 text-sm font-medium text-ink-muted">{stat.label}</dt>
                <dd className="font-display tabular order-1 text-[1.75rem] font-bold text-brand-600 dark:text-brand-300">
                  {stat.value}
                </dd>
                <p className="order-3 mt-1 text-[10px] tracking-wide text-ink-muted/60">{stat.caption}</p>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
