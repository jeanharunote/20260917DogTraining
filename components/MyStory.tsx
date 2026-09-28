/**
 * MyStory — 운영자 본인의 러닝 경험과 변화를 보여주는 섹션입니다.
 *
 * 1기라 참가자 후기가 없기 때문에, 지어낸 후기 대신 운영자의 실제 이야기로 신뢰를 쌓습니다.
 * 문구와 사진 경로는 data/challenge.ts 의 `myStory` 를 편집하세요.
 */
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { myStory } from "@/data/challenge";
import { cn } from "@/lib/utils";

export function MyStory() {
  // 비포·애프터 사진은 두 장 모두 등록했을 때만 보여줍니다.
  const hasPhotos = Boolean(myStory.beforeAfter.beforeImage && myStory.beforeAfter.afterImage);

  return (
    <section id="my-story" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow={myStory.eyebrow} title={myStory.title} />

        <Reveal delay={0.05} className="mt-10 flex flex-col items-center gap-5">
          {myStory.nursePhoto.src ? (
            <figure className="w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={myStory.nursePhoto.src}
                alt={myStory.nursePhoto.alt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="px-4 py-2.5 text-center text-xs text-ink-muted">
                {myStory.nursePhoto.caption}
              </figcaption>
            </figure>
          ) : null}
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
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-4">
            {myStory.changes.map((change) => (
              <div key={change.label} className="flex flex-col gap-1 bg-surface px-4 py-5 text-center">
                <dt className="order-2 text-xs text-ink-muted">{change.label}</dt>
                <dd className="font-display order-1 text-lg text-brand-600 dark:text-brand-300 sm:text-xl">
                  {change.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* 직접 달린 대회 — 실제 사진과 기록 */}
        <Reveal delay={0.1} className="mt-14">
          <h3 className="font-display text-center text-lg text-ink sm:text-xl">{myStory.races.title}</h3>
          <p className="mt-2 text-center text-sm text-ink-muted">{myStory.races.description}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {myStory.races.photos.map((photo, index) => (
              <figure
                key={photo.src}
                className={cn(
                  "overflow-hidden rounded-2xl border border-line bg-surface",
                  // 첫 사진(기록판)은 크게 보여줍니다.
                  index === 0 && "sm:col-span-2",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  className={cn(
                    "w-full object-cover",
                    index === 0 ? "aspect-[4/3] object-[center_35%]" : "aspect-[4/5]",
                  )}
                />
                <figcaption className="px-4 py-3 text-center text-xs font-medium text-ink-muted">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
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
