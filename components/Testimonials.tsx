/**
 * Testimonials — 지난 무료 챌린지 참가자들의 실제 설문 결과와 후기 (구글폼 · 카카오톡 오픈채팅 원문).
 * 첫 화면(비포·애프터) 바로 다음에 나옵니다. 문구는 data/challenge.ts 의 `testimonials` 를 편집하세요.
 */
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { testimonials } from "@/data/challenge";

export function Testimonials() {
  return (
    <section id="reviews" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeading
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          description={testimonials.description}
        />

        {/* 설문 결과 — 응답 수가 적어 "8명 중 6명"처럼 인원을 함께 보여줍니다 */}
        <Reveal delay={0.05} className="mt-12">
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-base text-ink sm:text-lg">{testimonials.survey.title}</h3>
              <span className="text-xs text-ink-muted">응답 {testimonials.survey.total}명</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">{testimonials.survey.question}</p>

            <ul className="mt-5 flex flex-col gap-3.5">
              {testimonials.survey.results.map((result) => (
                <li key={result.label} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-ink">{result.label}</span>
                    <span className="font-display shrink-0 text-brand-600 dark:text-brand-300">
                      {testimonials.survey.total}명 중 {result.count}명
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted ring-1 ring-inset ring-line">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                      style={{ width: `${(result.count / testimonials.survey.total) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-xs font-medium text-ink-muted">{testimonials.survey.answersTitle}</p>
            <ul className="mt-2.5 flex flex-col gap-2">
              {testimonials.survey.answers.map((answer) => (
                <li key={answer} className="rounded-xl bg-surface-muted px-4 py-2.5 text-sm leading-relaxed text-ink">
                  &ldquo;{answer}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <h3 className="font-display mt-12 text-center text-base text-ink sm:text-lg">{testimonials.chatTitle}</h3>
        <ul className="mt-6 columns-1 gap-4 sm:columns-2">
          {testimonials.items.map((item, index) => (
            <Reveal as="li" key={item.name} delay={index * 0.06} className="mb-4 flex break-inside-avoid gap-3">
              {/* 프로필 자리 — 참가자 사진 대신 닉네임 첫 글자 */}
              <span
                aria-hidden="true"
                className="font-display flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm text-brand-700 dark:bg-brand-900/50 dark:text-brand-200"
              >
                {item.name.slice(0, 1)}
              </span>
              <figure className="flex min-w-0 flex-col gap-1.5">
                <figcaption className="text-xs font-medium text-ink-muted">{item.name}</figcaption>
                <blockquote className="text-pretty rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink shadow-sm">
                  {item.text}
                </blockquote>
              </figure>
            </Reveal>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-ink-muted">
          무료 챌린지 참가자 설문(구글폼) · 카카오톡 오픈채팅 원문
        </p>
      </div>
    </section>
  );
}
