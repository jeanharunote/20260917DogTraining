"use client";

/**
 * SignupForm — 참가 신청 폼. react-hook-form + zod 로 검증하고 Formspree 로 전송합니다.
 *
 * 문구 수정은 data/challenge.ts 의 `signup`,
 * 검증 규칙(필수 여부, 에러 메시지)은 lib/schema.ts 를 편집하세요.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { challengeInfo, signup } from "@/data/challenge";
import { signupDefaultValues, signupSchema, type SignupFormValues } from "@/lib/schema";
import { cn } from "@/lib/utils";

/**
 * 신청 데이터가 전송되는 곳입니다.
 * .env.local 의 NEXT_PUBLIC_FORMSPREE_ENDPOINT 값을 사용합니다. (.env.example 참고)
 *
 * 다른 방식으로 바꾸고 싶다면 아래 sendSignup 함수만 교체하면 됩니다.
 * ── Google Sheets 로 보내려면 ────────────────────────────────────────────
 *   1) Google Apps Script 에서 doPost(e) 를 만들고 "웹 앱"으로 배포합니다.
 *   2) 발급된 /exec URL 을 NEXT_PUBLIC_FORMSPREE_ENDPOINT 자리에 넣습니다.
 *   3) fetch 옵션에 `mode: "no-cors"` 가 필요할 수 있습니다.
 * ── Supabase 로 보내려면 ─────────────────────────────────────────────────
 *   1) npm install @supabase/supabase-js
 *   2) signups 테이블을 만들고 insert 정책을 허용합니다.
 *   3) sendSignup 내부를 supabase.from("signups").insert(payload) 로 바꿉니다.
 *      (키 노출을 피하려면 app/api/signup/route.ts 라우트 핸들러를 거치세요.)
 */
type SubmitStatus = "idle" | "submitting" | "success" | "error";

async function sendSignup(values: SignupFormValues): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  if (!endpoint) {
    // 엔드포인트를 아직 설정하지 않았을 때: 개발 중에는 콘솔로만 확인하고 넘어갑니다.
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[SignupForm] NEXT_PUBLIC_FORMSPREE_ENDPOINT 가 설정되지 않아 전송을 건너뜁니다.\n" +
          ".env.example 을 .env.local 로 복사한 뒤 엔드포인트를 넣어주세요.\n",
        values,
      );
      return;
    }

    throw new Error("Formspree 엔드포인트가 설정되지 않았습니다.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...values,
      // 운영자가 메일에서 알아보기 쉽도록 어떤 기수 신청인지 함께 보냅니다.
      _challenge: challengeInfo.name,
      _period: challengeInfo.periodText,
      _submittedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`신청 전송에 실패했습니다. (status: ${response.status})`);
  }
}

export function SignupForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: signupDefaultValues,
  });

  const onSubmit = async (values: SignupFormValues) => {
    setStatus("submitting");

    try {
      await sendSignup(values);
      setStatus("success");
      reset(signupDefaultValues);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const isSubmitting = status === "submitting";

  if (status === "success") {
    return (
      <section id="signup" className="bg-surface-muted py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-5">
          <div
            role="status"
            className="flex flex-col items-center gap-4 rounded-3xl border border-brand-200 bg-brand-50 px-7 py-14 text-center dark:border-brand-800 dark:bg-brand-900/25"
          >
            <span aria-hidden="true" className="text-5xl">
              🎉
            </span>
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">{signup.successTitle}</h2>
            <p className="text-pretty max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
              {signup.successMessage}
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand-400"
            >
              {signup.successResetLabel}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="signup" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading
          eyebrow={signup.eyebrow}
          title={signup.title}
          description={signup.description}
        />

        {/* 신청 전 확인용 요약 정보 */}
        <Reveal delay={0.05} className="mt-10">
          <dl className="grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-4">
            {signup.summary.map((item) => (
              <div key={item.label} className="bg-surface px-4 py-4 text-center">
                <dt className="text-xs text-ink-muted">{item.label}</dt>
                <dd className="mt-1 text-sm font-bold text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-7 sm:p-9"
          >
            {/* 이름 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-ink">
                {signup.fields.name.label}
                <span className="ml-1 text-accent-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder={signup.fields.name.placeholder}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={inputClass(Boolean(errors.name))}
                {...register("name")}
              />
              {errors.name ? (
                <p id="name-error" role="alert" className={errorClass}>
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            {/* 이메일 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-ink">
                {signup.fields.email.label}
                <span className="ml-1 text-accent-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={signup.fields.email.placeholder}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : "email-hint"}
                className={inputClass(Boolean(errors.email))}
                {...register("email")}
              />
              {errors.email ? (
                <p id="email-error" role="alert" className={errorClass}>
                  {errors.email.message}
                </p>
              ) : (
                <p id="email-hint" className={hintClass}>
                  {signup.fields.email.hint}
                </p>
              )}
            </div>

            {/* 연락처 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-semibold text-ink">
                {signup.fields.phone.label}
                <span className="ml-1 text-accent-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={signup.fields.phone.placeholder}
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                className={inputClass(Boolean(errors.phone))}
                {...register("phone")}
              />
              {errors.phone ? (
                <p id="phone-error" role="alert" className={errorClass}>
                  {errors.phone.message}
                </p>
              ) : (
                <p id="phone-hint" className={hintClass}>
                  {signup.fields.phone.hint}
                </p>
              )}
            </div>

            {/* 러닝 경력 (라디오 그룹) */}
            <fieldset
              className="flex flex-col gap-2"
              aria-invalid={errors.career ? "true" : "false"}
              aria-describedby={errors.career ? "career-error" : undefined}
            >
              <legend className="text-sm font-semibold text-ink">
                {signup.fields.career.label}
                <span className="ml-1 text-accent-500" aria-hidden="true">
                  *
                </span>
              </legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-3">
                {signup.careerOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer flex-col gap-1 rounded-2xl border border-line bg-surface-muted px-4 py-3 transition-colors hover:border-brand-400 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:has-[:checked]:bg-brand-900/30"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        value={option.value}
                        className="size-4 accent-brand-600"
                        {...register("career")}
                      />
                      <span className="text-sm font-semibold text-ink">{option.label}</span>
                    </span>
                    <span className="pl-6 text-xs text-ink-muted">{option.description}</span>
                  </label>
                ))}
              </div>
              {errors.career ? (
                <p id="career-error" role="alert" className={errorClass}>
                  {errors.career.message}
                </p>
              ) : null}
            </fieldset>

            {/* 참가 동기 (선택) */}
            <div className="flex flex-col gap-2">
              <label htmlFor="motivation" className="text-sm font-semibold text-ink">
                {signup.fields.motivation.label}
                <span className="ml-2 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                  {signup.fields.motivation.optional}
                </span>
              </label>
              <textarea
                id="motivation"
                rows={3}
                placeholder={signup.fields.motivation.placeholder}
                aria-invalid={errors.motivation ? "true" : "false"}
                aria-describedby={errors.motivation ? "motivation-error" : "motivation-hint"}
                className={cn(inputClass(Boolean(errors.motivation)), "resize-y")}
                {...register("motivation")}
              />
              {errors.motivation ? (
                <p id="motivation-error" role="alert" className={errorClass}>
                  {errors.motivation.message}
                </p>
              ) : (
                <p id="motivation-hint" className={hintClass}>
                  {signup.fields.motivation.hint}
                </p>
              )}
            </div>

            {/* 개인정보 수집·이용 동의 (필수) */}
            <div className="flex flex-col gap-2 rounded-2xl bg-surface-muted p-5">
              <label htmlFor="agree" className="flex cursor-pointer items-start gap-3">
                <input
                  id="agree"
                  type="checkbox"
                  aria-invalid={errors.agree ? "true" : "false"}
                  aria-describedby={errors.agree ? "agree-error agree-detail" : "agree-detail"}
                  className="mt-0.5 size-4 shrink-0 accent-brand-600"
                  {...register("agree")}
                />
                <span className="text-sm font-medium text-ink">{signup.fields.agree.label}</span>
              </label>
              <p id="agree-detail" className="pl-7 text-xs leading-relaxed text-ink-muted">
                {signup.fields.agree.detail}
              </p>
              {errors.agree ? (
                <p id="agree-error" role="alert" className={cn(errorClass, "pl-7")}>
                  {errors.agree.message}
                </p>
              ) : null}
            </div>

            {/* 전송 실패 메시지 */}
            {status === "error" ? (
              <div
                role="alert"
                className="flex flex-col gap-1 rounded-2xl border border-accent-300 bg-accent-100 px-5 py-4 dark:border-accent-500/40 dark:bg-accent-500/10"
              >
                <p className="text-sm font-bold text-accent-600 dark:text-accent-300">
                  {signup.errorTitle}
                </p>
                <p className="text-xs leading-relaxed text-ink-muted">{signup.errorMessage}</p>
              </div>
            ) : null}

            {/* CTA 3/3 — 최종 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  {signup.submittingLabel}
                </>
              ) : (
                signup.submitLabel
              )}
            </button>

            <p className="text-center text-xs text-ink-muted">{signup.reassurance}</p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* --- 폼 요소 공통 스타일 ------------------------------------------------ */
const errorClass = "text-xs font-medium text-accent-600 dark:text-accent-400";
const hintClass = "text-xs text-ink-muted";

function inputClass(hasError: boolean): string {
  return cn(
    "w-full rounded-2xl border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 transition-colors",
    hasError ? "border-accent-500" : "border-line focus:border-brand-500",
  );
}
