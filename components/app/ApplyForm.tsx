"use client";

/** ApplyForm — 로그인한 사용자가 참가 신청서를 작성합니다. 신청하면 "입금 대기" 상태가 됩니다. */
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "firebase/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Card, inputClass, Notice, primaryButton } from "@/components/app/ui";
import { signup } from "@/data/challenge";
import { createEnrollment, type CourseValue } from "@/lib/data";
import { signupSchema, type SignupFormValues } from "@/lib/schema";
import { cn } from "@/lib/utils";

export function ApplyForm({ user, onApplied }: { user: User; onApplied: () => Promise<void> }) {
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    // 구글 계정 정보로 미리 채워 입력을 줄입니다.
    defaultValues: {
      name: user.displayName ?? "",
      email: user.email ?? "",
      phone: "",
      career: "" as SignupFormValues["career"],
      motivation: "",
      agree: false as unknown as true,
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setSubmitError("");

    try {
      await createEnrollment({
        uid: user.uid,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        course: values.career as CourseValue,
        motivation: values.motivation?.trim(),
        agree: true,
      });
      await onApplied();
    } catch (error) {
      console.error("[ApplyForm] 신청 저장 실패", error);
      setSubmitError("신청서를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const field = (hasError: boolean) => cn(inputClass, hasError && "border-accent-500");

  return (
    <Card>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="apply-name" className="text-sm font-semibold text-ink">
            {signup.fields.name.label}
          </label>
          <input
            id="apply-name"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
            className={field(Boolean(errors.name))}
            {...register("name")}
          />
          {errors.name ? <FieldError message={errors.name.message} /> : null}
          <p className="text-xs text-ink-muted">입금자명과 같은 이름으로 적어주세요.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="apply-email" className="text-sm font-semibold text-ink">
            {signup.fields.email.label}
          </label>
          <input
            id="apply-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            className={field(Boolean(errors.email))}
            {...register("email")}
          />
          {errors.email ? <FieldError message={errors.email.message} /> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="apply-phone" className="text-sm font-semibold text-ink">
            {signup.fields.phone.label}
          </label>
          <input
            id="apply-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={signup.fields.phone.placeholder}
            aria-invalid={errors.phone ? "true" : "false"}
            className={field(Boolean(errors.phone))}
            {...register("phone")}
          />
          {errors.phone ? (
            <FieldError message={errors.phone.message} />
          ) : (
            <p className="text-xs text-ink-muted">{signup.fields.phone.hint}</p>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-ink">{signup.fields.career.label}</legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-3">
            {signup.careerOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer flex-col gap-1 rounded-xl border border-line bg-surface-muted px-4 py-3 transition-colors hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 dark:has-[:checked]:bg-brand-900/30"
              >
                <span className="flex items-center gap-2">
                  <input type="radio" value={option.value} className="size-4 accent-brand-600" {...register("career")} />
                  <span className="text-sm font-semibold text-ink">{option.label}</span>
                </span>
                <span className="pl-6 text-xs text-ink-muted">{option.description}</span>
              </label>
            ))}
          </div>
          {errors.career ? <FieldError message={errors.career.message} /> : null}
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="apply-motivation" className="text-sm font-semibold text-ink">
            {signup.fields.motivation.label}{" "}
            <span className="text-xs font-normal text-ink-muted">({signup.fields.motivation.optional})</span>
          </label>
          <textarea
            id="apply-motivation"
            rows={3}
            placeholder={signup.fields.motivation.placeholder}
            className={cn(field(Boolean(errors.motivation)), "resize-y")}
            {...register("motivation")}
          />
          {errors.motivation ? <FieldError message={errors.motivation.message} /> : null}
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-surface-muted p-4">
          <label htmlFor="apply-agree" className="flex cursor-pointer items-start gap-3">
            <input
              id="apply-agree"
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-brand-600"
              {...register("agree")}
            />
            <span className="text-sm font-medium text-ink">{signup.fields.agree.label}</span>
          </label>
          <p className="pl-7 text-xs leading-relaxed text-ink-muted">
            {signup.fields.agree.detail}{" "}
            <a href="/legal/privacy" target="_blank" className="underline underline-offset-2">
              개인정보처리방침
            </a>
          </p>
          {errors.agree ? <FieldError message={errors.agree.message} className="pl-7" /> : null}
        </div>

        {submitError ? <Notice tone="error">{submitError}</Notice> : null}

        <button type="submit" disabled={isSubmitting} className={cn(primaryButton, "py-3.5")}>
          {isSubmitting ? "신청서를 저장하는 중..." : "신청하기"}
        </button>
      </form>
    </Card>
  );
}

function FieldError({ message, className }: { message?: string; className?: string }) {
  return (
    <p role="alert" className={cn("text-xs font-medium text-accent-600 dark:text-accent-400", className)}>
      {message}
    </p>
  );
}
