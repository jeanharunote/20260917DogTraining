/**
 * Testimonials — 먼저 완주한 참가자들의 후기 카드 그리드입니다.
 * 후기 수정은 data/challenge.ts 의 `testimonials.items` 를 편집하세요.
 */
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { testimonials } from "@/data/challenge";

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          description={testimonials.description}
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {testimonials.items.map((item, index) => (
            <Reveal
              as="li"
              key={item.name + item.badge}
              delay={index * 0.07}
              className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-line bg-surface-muted p-7"
            >
              <figure className="flex flex-col gap-4">
                <span aria-hidden="true" className="text-2xl leading-none text-brand-300">
                  &ldquo;
                </span>
                <blockquote className="text-pretty text-sm leading-[1.85] text-ink">
                  {item.quote}
                </blockquote>
                <figcaption className="flex items-center gap-3 pt-2">
                  {/* 프로필 이미지 대신 이름 첫 글자를 사용합니다. (placeholder) */}
                  <span
                    aria-hidden="true"
                    className="font-display flex size-10 items-center justify-center rounded-full bg-brand-50 text-sm text-brand-700 ring-1 ring-line dark:bg-brand-900/40 dark:text-brand-200"
                  >
                    {item.name.charAt(0)}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-display text-sm text-ink">{item.name}</span>
                    <span className="text-xs text-ink-muted">{item.meta}</span>
                  </span>
                  <span className="ml-auto rounded-full border border-line px-2.5 py-1 text-[10px] font-medium tracking-wide text-ink-muted">
                    {item.badge}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
