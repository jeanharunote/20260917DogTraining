/**
 * Hero — 첫 화면. 핵심 메시지 + 카운트다운 + 첫 번째 CTA(1/3)를 보여줍니다.
 * 문구 수정은 data/challenge.ts 의 `hero` 를 편집하세요.
 */
import { CtaButton } from "@/components/CtaButton";
import { Countdown } from "@/components/Countdown";
import { Reveal } from "@/components/Reveal";
import { cta, hero } from "@/data/challenge";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-brand-900 pb-20 pt-28 sm:pb-28 sm:pt-36"
    >
      {/* 배경: 러닝 분위기의 그래디언트 (placeholder) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(168deg,#171327_0%,#241e3a_30%,#352c54_62%,#473c70_100%)]"
      />
      {/* 해질 무렵 느낌을 주는 오렌지 빛 번짐 */}
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -right-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-accent-500/15 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="absolute -left-32 top-10 -z-10 h-[26rem] w-[26rem] rounded-full bg-brand-400/20 blur-[100px]"
      />

      {/*
        TODO: 실제 러닝 사진을 쓰려면 /public 에 이미지를 넣고
        data/challenge.ts 의 hero.backgroundImage 에 "/파일명.jpg" 를 적어주세요.
      */}
      {hero.backgroundImage ? (
        <div
          role="img"
          aria-label={hero.backgroundImageAlt}
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${hero.backgroundImage})` }}
        />
      ) : null}

      <div className="mx-auto max-w-6xl px-5">
        <div className="flex max-w-3xl flex-col items-start gap-7">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-1.5 text-xs font-medium tracking-wide text-brand-100 ring-1 ring-inset ring-white/15">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-400" />
              {hero.badge}
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-display text-balance text-[2.1rem] font-bold leading-[1.28] text-white sm:text-5xl lg:text-[3.5rem]">
              {hero.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-3">
            <p className="font-display text-lg text-brand-200 sm:text-xl">{hero.subCopy}</p>
            <p className="max-w-xl text-pretty text-[0.95rem] leading-[1.75] text-white/65 sm:text-base">
              {hero.description}
            </p>
          </Reveal>

          <Reveal delay={0.15} className="w-full">
            <Countdown />
          </Reveal>

          {/* CTA 1/3 */}
          <Reveal delay={0.2} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <CtaButton variant="light" className="w-full sm:w-auto">
              {cta.primary}
            </CtaButton>
            <CtaButton href="#roadmap" variant="ghost" className="w-full sm:w-auto">
              {cta.secondary}
            </CtaButton>
          </Reveal>

          <Reveal delay={0.25} className="w-full">
            <dl className="grid w-full max-w-lg grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-3">
              {hero.highlights.map((item) => (
                <div key={item.label} className="bg-brand-900/40 px-4 py-4 backdrop-blur">
                  <dt className="text-[11px] font-medium tracking-wide text-white/50">{item.label}</dt>
                  <dd className="font-display mt-1 text-sm text-white sm:text-base">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
