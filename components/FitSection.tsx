/**
 * FitSection — "러닝 해빗 클럽은 이런 분들께 잘 맞아요!" 추천 대상 섹션. 첫 화면 바로 다음에 나옵니다.
 * 문구는 data/challenge.ts 의 `fit` 을, 사진은 `myStory.beforeAfter` 를 편집하세요.
 */
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { fit, myStory } from "@/data/challenge";

export function FitSection() {
  const hasPhotos = Boolean(myStory.beforeAfter.beforeImage && myStory.beforeAfter.afterImage);

  return (
    <section id="fit" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeading eyebrow={fit.eyebrow} title={fit.title} description={fit.description} />

        <ul className="mt-12 grid items-start gap-5 md:grid-cols-2">
          {fit.items.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 0.08}
              className="card-soft flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 sm:p-7"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl ring-1 ring-brand-100 dark:bg-brand-900/30 dark:ring-brand-800"
                >
                  {item.emoji}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-balance text-lg leading-snug text-ink">{item.title}</h3>
                  <p className="text-pretty text-sm leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </div>

              {item.withBeforeAfter && hasPhotos ? (
                <figure className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        src: myStory.beforeAfter.beforeImage,
                        alt: myStory.beforeAfter.beforeAlt,
                        label: myStory.beforeAfter.beforeLabel,
                        weight: myStory.beforeAfter.beforeWeight,
                      },
                      {
                        src: myStory.beforeAfter.afterImage,
                        alt: myStory.beforeAfter.afterAlt,
                        label: myStory.beforeAfter.afterLabel,
                        weight: myStory.beforeAfter.afterWeight,
                      },
                    ].map((photo) => (
                      <div key={photo.label} className="relative overflow-hidden rounded-xl border border-line">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.src} alt={photo.alt} className="aspect-[3/4] w-full object-cover" />
                        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                          {photo.label}
                        </span>
                        {/* 몸무게 */}
                        <span className="font-display absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-6 text-center text-lg font-bold text-white sm:text-xl">
                          {photo.weight}
                        </span>
                      </div>
                    ))}
                  </div>
                  <figcaption className="flex flex-col items-center gap-1 text-center">
                    <span className="font-display text-base text-brand-600 dark:text-brand-300">
                      {myStory.beforeAfter.beforeWeight} → {myStory.beforeAfter.afterWeight}
                    </span>
                    <span className="text-xs text-ink-muted">{myStory.beforeAfter.caption}</span>
                  </figcaption>
                </figure>
              ) : null}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
