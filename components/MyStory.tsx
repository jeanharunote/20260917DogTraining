/**
 * MyStory — 운영자 본인의 러닝 경험과 변화를 보여주는 섹션입니다.
 *
 * 1기라 참가자 후기가 없기 때문에, 지어낸 후기 대신 운영자의 실제 이야기로 신뢰를 쌓습니다.
 * 문구와 사진 경로는 data/challenge.ts 의 `myStory` 를 편집하세요.
 */
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { footer, myStory } from "@/data/challenge";
import { cn } from "@/lib/utils";

export function MyStory() {
  return (
    <section id="my-story" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow={myStory.eyebrow} title={myStory.title} />

        {/* 운영자 소개 */}
        <Reveal delay={0.05} className="mt-10">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-7 py-7 text-center sm:px-9">
            <p className="font-display text-base text-brand-600 sm:text-lg dark:text-brand-300">{myStory.intro}</p>
            <ul className="flex w-full max-w-sm flex-col gap-2 text-sm">
              {myStory.career.map((item) => (
                <li key={item.text} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-0 last:pb-0">
                  <span className="shrink-0 text-xs text-ink-muted">{item.period}</span>
                  <span className="text-right font-medium text-ink">{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              {footer.socials.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-brand-300 hover:text-ink"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 성취 요약 — 숫자로 한눈에 */}
        <Reveal delay={0.1} className="mt-6">
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

        {/* 성장 기록 — 짧은 타임라인 */}
        <Reveal delay={0.15} className="mt-6">
          <div className="rounded-2xl border border-line bg-surface p-7 sm:p-9">
            <ol className="relative flex flex-col gap-6 border-l-2 border-brand-200 pl-6 dark:border-brand-800">
              {myStory.milestones.map((item, index) => (
                <li key={item.title} className="relative">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-surface",
                      index === myStory.milestones.length - 1 ? "bg-brand-600 dark:bg-brand-300" : "bg-brand-300 dark:bg-brand-700",
                    )}
                  />
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-300">{item.when}</span>
                  <p className="font-display mt-1 text-base leading-snug text-ink sm:text-lg">{item.title}</p>
                  <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-muted">{item.detail}</p>
                </li>
              ))}
            </ol>
            <p className="mt-7 text-pretty border-t border-line pt-6 text-center text-sm font-medium leading-relaxed text-ink sm:text-base">
              {myStory.message}
            </p>
          </div>
        </Reveal>

        {/* 직접 달린 대회 — 기록표 · 사진 · 기록증 */}
        <Reveal delay={0.1} className="mt-14">
          <h3 className="font-display text-center text-lg text-ink sm:text-xl">{myStory.races.title}</h3>
          <p className="mt-2 text-center text-sm text-ink-muted">{myStory.races.description}</p>

          {/* 기록표 */}
          <div className="mt-7 overflow-hidden rounded-2xl border border-line bg-surface">
            <table className="w-full text-left text-[13px] sm:text-sm">
              <caption className="sr-only">대회별 완주 기록</caption>
              <thead className="bg-surface-muted text-[11px] text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">대회</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">종목</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">기록</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {myStory.races.records.map((race) => (
                  <tr key={race.name + race.record}>
                    <td className="px-4 py-3">
                      <span className="block text-ink">{race.name}</span>
                      {race.date || race.note ? (
                        <span className="text-[11px] text-ink-muted">
                          {[race.date, race.note].filter(Boolean).join(" · ")}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-muted">{race.course}</td>
                    <td className="font-display whitespace-nowrap px-4 py-3 text-right text-brand-600 dark:text-brand-300">
                      {race.record}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 대회 사진 — 한 장이면 원래 비율 그대로 가운데에 (비어 있으면 칸 자체를 그리지 않습니다) */}
          {myStory.races.photos.length > 0 ? (
            <div
              className={cn(
                "mt-4 grid gap-3",
                myStory.races.photos.length > 1 ? "grid-cols-2" : "mx-auto max-w-sm grid-cols-1",
              )}
            >
              {myStory.races.photos.map((photo, index) => {
                const single = myStory.races.photos.length === 1;

                return (
                  <figure
                    key={photo.src}
                    className={cn(
                      "overflow-hidden rounded-2xl border border-line bg-surface",
                      // 여러 장일 때 첫 사진은 크게 보여줍니다.
                      !single && index === 0 && "col-span-2",
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
                        "w-full",
                        single
                          ? "h-auto"
                          : index === 0
                            ? "aspect-[4/3] object-cover object-[center_35%]"
                            : "aspect-square object-cover",
                      )}
                    />
                    <figcaption className="px-3 py-2.5 text-center text-[11px] font-medium text-ink-muted sm:text-xs">
                      {photo.caption}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          ) : null}

          {/* 기록증 */}
          <p className="mt-8 text-center text-xs font-semibold text-ink-muted">기록증</p>
          <div
            className={cn(
              "mt-3 grid gap-2 sm:gap-3",
              myStory.races.certificates.length >= 3 ? "grid-cols-3" : "mx-auto max-w-md grid-cols-2",
            )}
          >
            {myStory.races.certificates.map((cert) => (
              <figure key={cert.src} className="overflow-hidden rounded-xl border border-line bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cert.src}
                  alt={cert.alt}
                  width={cert.width}
                  height={cert.height}
                  loading="lazy"
                  className="aspect-[3/4] w-full bg-surface-muted object-contain"
                />
                <figcaption className="px-2 py-2 text-center text-[10px] leading-snug text-ink-muted sm:text-[11px]">
                  {cert.caption}
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
