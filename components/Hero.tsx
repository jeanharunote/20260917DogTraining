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
        className="absolute inset-0 -z-20 bg-[radial-gradient(125%_125%_at_15%_0%,#9333ea_0%,#6b21a8_35%,#3b0f63_70%,#25084a_100%)]"
      />
      {/* 해질 무렵 느낌을 주는 오렌지 빛 번짐 */}
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-accent-500/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-24 -z-10 h-[24rem] w-[24rem] rounded-full bg-brand-400/30 blur-3xl"
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
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 px-4 py-1.5 text-xs font-semibold text-accent-100 ring-1 ring-inset ring-accent-300/40">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-400" />
              {hero.badge}
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-display text-balance text-4xl leading-[1.25] text-white sm:text-5xl lg:text-6xl">
              {hero.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-3">
            <p className="font-display text-gradient text-xl sm:text-2xl">{hero.subCopy}</p>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
              {hero.description}
            </p>
          </Reveal>

          <Reveal delay={0.15} className="w-full">
            <Countdown />
          </Reveal>

          {/* CTA 1/3 */}
          <Reveal delay={0.2} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <CtaButton className="w-full sm:w-auto">{cta.primary}</CtaButton>
            <CtaButton href="#roadmap" variant="ghost" className="w-full sm:w-auto">
              {cta.secondary}
            </CtaButton>
          </Reveal>

          <Reveal delay={0.25} className="w-full">
            <dl className="grid w-full max-w-lg grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-3">
              {hero.highlights.map((item) => (
                <div key={item.label} className="bg-brand-900/50 px-4 py-4 backdrop-blur">
                  <dt className="text-xs font-medium text-white/60">{item.label}</dt>
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
