/**
 * MyStory — 운영자 본인의 러닝 경험과 변화를 보여주는 섹션입니다.
 *
 * 1기라 참가자 후기가 없기 때문에, 지어낸 후기 대신 운영자의 실제 이야기로 신뢰를 쌓습니다.
 * 문구와 사진 경로는 data/challenge.ts 의 `myStory` 를 편집하세요.
 */
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { myStory } from "@/data/challenge";

export function MyStory() {
  // 비포·애프터 사진은 두 장 모두 등록했을 때만 보여줍니다.
  const hasPhotos = Boolean(myStory.beforeAfter.beforeImage && myStory.beforeAfter.afterImage);

  return (
    <section id="my-story" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow={myStory.eyebrow} title={myStory.title} />

        <Reveal delay={0.05} className="mt-10">
          <p className="text-center text-sm font-medium text-brand-600 dark:text-brand-300">
            {myStory.intro}
          </p>
        </Reveal>

        {/* 비포·애프터 사진 */}
        {hasPhotos ? (
          <Reveal delay={0.1} className="mt-10">
            <figure className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    src: myStory.beforeAfter.beforeImage,
                    alt: myStory.beforeAfter.beforeAlt,
                    label: myStory.beforeAfter.beforeLabel,
                  },
                  {
                    src: myStory.beforeAfter.afterImage,
                    alt: myStory.beforeAfter.afterAlt,
                    label: myStory.beforeAfter.afterLabel,
                  },
                ].map((photo) => (
                  <div
                    key={photo.label}
                    className="relative overflow-hidden rounded-2xl border border-line bg-surface"
                  >
                    {/* 사진 비율을 모르기 때문에 일반 img 태그로 단순하게 보여줍니다. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                      {photo.label}
                    </span>
                  </div>
                ))}
              </div>
              <figcaption className="text-center text-xs text-ink-muted">
                {myStory.beforeAfter.caption}
              </figcaption>
            </figure>
          </Reveal>
        ) : null}

        {/* 이야기 본문 */}
        <Reveal delay={0.15} className="mt-10">
          <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-7 sm:p-9">
            {myStory.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-pretty text-sm leading-[1.9] text-ink sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        {/* 변화 요약 */}
        <Reveal delay={0.2} className="mt-6">
          <dl className="grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-3">
            {myStory.changes.map((change) => (
              <div key={change.label} className="bg-surface px-5 py-6 text-center">
                <dt className="order-2 text-xs text-ink-muted">{change.label}</dt>
                <dd className="font-display order-1 text-xl text-brand-600 dark:text-brand-300">
                  {change.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.25} className="mt-10 text-center">
          <p className="font-display text-lg text-brand-600 dark:text-brand-300 sm:text-xl">
            {myStory.closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
