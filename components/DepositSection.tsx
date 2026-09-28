/**
 * DepositSection — 보증금 제도를 설명하고, 왜 효과가 있는지 행동과학 근거로 설득합니다.
 * 문구 수정은 data/challenge.ts 의 `depositPitch` 를 편집하세요.
 */
import { CtaButton } from "@/components/CtaButton";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { cta, depositPitch } from "@/data/challenge";

export function DepositSection() {
  return (
    <section id="deposit" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow={depositPitch.eyebrow} title={depositPitch.title} description={depositPitch.lead} />

        {/* 근거 3가지 */}
        <ul className="mt-12 flex flex-col gap-4">
          {depositPitch.reasons.map((reason, index) => (
            <Reveal
              as="li"
              key={reason.title}
              delay={index * 0.06}
              className="card-soft flex gap-5 rounded-2xl border border-line bg-surface p-6 sm:p-7"
            >
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg ring-1 ring-line dark:bg-brand-900/30"
              >
                {reason.emoji}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-base text-ink sm:text-lg">{reason.title}</h3>
                <p className="text-pretty text-sm leading-[1.85] text-ink-muted">{reason.body}</p>
                {reason.source ? (
                  <p className="text-[11px] font-medium text-brand-600 dark:text-brand-300">출처: {reason.source}</p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ul>

        {/* 환급 규칙 한눈에 */}
        <Reveal delay={0.1} className="mt-8">
          <dl className="grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2">
            {depositPitch.rules.map((rule) => (
              <div key={rule.label} className="flex flex-col gap-1 bg-surface-muted px-5 py-4">
                <dt className="text-xs text-ink-muted">{rule.label}</dt>
                <dd className="font-display text-sm text-ink sm:text-base">{rule.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 flex flex-col items-center gap-6 text-center">
          <p className="font-display text-pretty text-lg text-brand-600 dark:text-brand-300 sm:text-xl">
            {depositPitch.closing}
          </p>
          <CtaButton>{cta.primary}</CtaButton>
        </Reveal>

        {/* 참고 문헌 */}
        <Reveal delay={0.2} className="mt-12">
          <p className="text-[11px] font-semibold text-ink-muted">참고한 연구</p>
          <ol className="mt-2 flex flex-col gap-1.5">
            {depositPitch.references.map((ref) => (
              <li key={ref.href} className="text-[11px] leading-relaxed text-ink-muted">
                <a href={ref.href} target="_blank" rel="noreferrer noopener" className="underline-offset-2 hover:underline">
                  {ref.label}
                </a>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
