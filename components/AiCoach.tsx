"use client";

/**
 * AiCoach — 방문자가 자신의 Gemini API 키를 넣고, 키·체중·경험에 맞춘
 * 4주 러닝 계획과 부상 예방 조언을 받아보는 섹션입니다.
 *
 * 문구 수정은 data/challenge.ts 의 `aiCoach`,
 * 입력 검증은 lib/coach-schema.ts 를 편집하세요.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { aiCoach, signup } from "@/data/challenge";
import {
  coachDefaultValues,
  coachResultSchema,
  coachSchema,
  type CoachFormValues,
  type CoachPayload,
  type CoachResult,
} from "@/lib/coach-schema";
import { cn } from "@/lib/utils";

/** 키를 기억해 달라고 했을 때 저장하는 위치입니다. (이 브라우저 안에만 저장됩니다) */
const API_KEY_STORAGE = "running-habit:gemini-api-key";

type Status = "idle" | "loading" | "done" | "error";

export function AiCoach() {
  // API 키와 "기억하기" 체크는 브라우저에만 존재하는 값이라 ref 로 다룹니다.
  // (서버 렌더링 결과와 어긋나지 않게 하고, 불필요한 리렌더도 막습니다)
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const rememberRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CoachResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    // 폼은 문자열로 받고, 검증을 거치면서 숫자로 바뀌어 전달됩니다.
  } = useForm<CoachFormValues, unknown, CoachPayload>({
    resolver: zodResolver(coachSchema),
    defaultValues: coachDefaultValues,
  });

  // 이전에 저장해 둔 키가 있으면 마운트 후 입력칸에 채워 넣습니다.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(API_KEY_STORAGE);

      if (saved && apiKeyRef.current && rememberRef.current) {
        apiKeyRef.current.value = saved;
        rememberRef.current.checked = true;
      }
    } catch {
      // 시크릿 모드 등에서 접근이 막힐 수 있어 조용히 넘어갑니다.
    }
  }, []);

  const persistKey = (key: string, shouldRemember: boolean) => {
    try {
      if (shouldRemember && key) {
        window.localStorage.setItem(API_KEY_STORAGE, key);
      } else {
        window.localStorage.removeItem(API_KEY_STORAGE);
      }
    } catch {
      // 저장에 실패해도 기능 자체는 계속 동작합니다.
    }
  };

  const onSubmit = async (values: CoachPayload) => {
    const key = apiKeyRef.current?.value.trim() ?? "";

    if (!key) {
      setStatus("error");
      setErrorMessage("Gemini API 키를 먼저 입력해 주세요.");
      apiKeyRef.current?.focus();

      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, apiKey: key }),
      });

      const data = (await response.json()) as { result?: unknown; error?: string };

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? aiCoach.errorFallback);

        return;
      }

      const parsed = coachResultSchema.safeParse(data.result);

      if (!parsed.success) {
        setStatus("error");
        setErrorMessage("AI 응답 형태가 예상과 달라요. 다시 시도해 주세요.");

        return;
      }

      persistKey(key, rememberRef.current?.checked ?? false);
      setResult(parsed.data);
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMessage(aiCoach.errorFallback);
    }
  };

  const isLoading = status === "loading";

  return (
    <section id="ai-coach" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading
          eyebrow={aiCoach.eyebrow}
          title={aiCoach.title}
          description={aiCoach.description}
        />

        <Reveal delay={0.05} className="mt-12">
          <form
            noValidate
            // 제출 순간에 핸들러를 만들어, 렌더 중에 ref 를 읽지 않도록 합니다.
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
            className="flex flex-col gap-6 rounded-2xl border border-line bg-surface-muted p-7 sm:p-9"
          >
            {/* API 키 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="coach-api-key" className="text-sm font-semibold text-ink">
                {aiCoach.apiKey.label}
                <span className="ml-1 text-brand-400" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                ref={apiKeyRef}
                id="coach-api-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                defaultValue=""
                placeholder={aiCoach.apiKey.placeholder}
                aria-describedby="coach-api-key-hint"
                className={inputClass(false)}
              />
              <p id="coach-api-key-hint" className={hintClass}>
                {aiCoach.apiKey.hint}{" "}
                <a
                  href={aiCoach.apiKey.helpUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-brand-600 underline-offset-4 hover:underline dark:text-brand-300"
                >
                  {aiCoach.apiKey.helpLabel}
                </a>
              </p>
              <label className="mt-1 flex cursor-pointer items-center gap-2">
                <input
                  ref={rememberRef}
                  type="checkbox"
                  defaultChecked={false}
                  onChange={(event) =>
                    persistKey(apiKeyRef.current?.value.trim() ?? "", event.target.checked)
                  }
                  className="size-4 accent-brand-600"
                />
                <span className="text-xs text-ink-muted">{aiCoach.apiKey.rememberLabel}</span>
              </label>
            </div>

            {/* 키 · 체중 · 나이 */}
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                id="coach-height"
                label={aiCoach.fields.height.label}
                unit={aiCoach.fields.height.unit}
                placeholder={aiCoach.fields.height.placeholder}
                error={errors.height?.message}
                registration={register("height")}
              />
              <NumberField
                id="coach-weight"
                label={aiCoach.fields.weight.label}
                unit={aiCoach.fields.weight.unit}
                placeholder={aiCoach.fields.weight.placeholder}
                error={errors.weight?.message}
                registration={register("weight")}
              />
              <NumberField
                id="coach-age"
                label={aiCoach.fields.age.label}
                unit={aiCoach.fields.age.unit}
                placeholder={aiCoach.fields.age.placeholder}
                optional={aiCoach.fields.age.optional}
                error={errors.age?.message}
                registration={register("age")}
              />
            </div>

            {/* 러닝 경험 */}
            <fieldset
              className="flex flex-col gap-2"
              aria-describedby={errors.experience ? "coach-experience-error" : undefined}
            >
              <legend className="text-sm font-semibold text-ink">
                {aiCoach.fields.experience.label}
                <span className="ml-1 text-brand-400" aria-hidden="true">
                  *
                </span>
              </legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-3">
                {signup.careerOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 dark:has-[:checked]:bg-brand-900/30"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="size-4 accent-brand-600"
                      {...register("experience")}
                    />
                    <span className="text-sm font-medium text-ink">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.experience ? (
                <p id="coach-experience-error" role="alert" className={errorClass}>
                  {errors.experience.message}
                </p>
              ) : null}
            </fieldset>

            {/* 주당 가능 일수 · 선호 시간대 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="coach-days"
                label={aiCoach.fields.daysPerWeek.label}
                unit={aiCoach.fields.daysPerWeek.unit}
                placeholder="3"
                error={errors.daysPerWeek?.message}
                registration={register("daysPerWeek")}
              />

              <div className="flex flex-col gap-2">
                <label htmlFor="coach-time" className="text-sm font-semibold text-ink">
                  {aiCoach.fields.preferredTime.label}
                  <span className="ml-1 text-brand-400" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="coach-time"
                  aria-invalid={errors.preferredTime ? "true" : "false"}
                  aria-describedby={errors.preferredTime ? "coach-time-error" : undefined}
                  className={inputClass(Boolean(errors.preferredTime))}
                  {...register("preferredTime")}
                >
                  <option value="">선택해 주세요</option>
                  {aiCoach.timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.preferredTime ? (
                  <p id="coach-time-error" role="alert" className={errorClass}>
                    {errors.preferredTime.message}
                  </p>
                ) : null}
              </div>
            </div>

            {/* 걱정되는 점 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="coach-concern" className="text-sm font-semibold text-ink">
                {aiCoach.fields.concern.label}
                <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                  {aiCoach.fields.concern.optional}
                </span>
              </label>
              <textarea
                id="coach-concern"
                rows={2}
                placeholder={aiCoach.fields.concern.placeholder}
                aria-invalid={errors.concern ? "true" : "false"}
                aria-describedby={errors.concern ? "coach-concern-error" : undefined}
                className={cn(inputClass(Boolean(errors.concern)), "resize-y")}
                {...register("concern")}
              />
              {errors.concern ? (
                <p id="coach-concern-error" role="alert" className={errorClass}>
                  {errors.concern.message}
                </p>
              ) : null}
            </div>

            {status === "error" ? (
              <div
                role="alert"
                className="flex flex-col gap-1 rounded-xl border border-accent-300 bg-accent-100 px-5 py-4 dark:border-accent-500/40 dark:bg-accent-500/10"
              >
                <p className="text-sm font-semibold text-accent-600 dark:text-accent-300">
                  {aiCoach.errorTitle}
                </p>
                <p className="text-xs leading-relaxed text-ink-muted">{errorMessage}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient font-display inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[0.95rem] font-medium transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  {aiCoach.submittingLabel}
                </>
              ) : (
                aiCoach.submitLabel
              )}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-ink-muted">
              {aiCoach.disclaimer}
            </p>
          </form>
        </Reveal>

        {/* 결과 */}
        <AnimatePresence>
          {status === "done" && result ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 flex flex-col gap-4"
              // 결과가 나오면 스크린리더가 읽어주도록 합니다.
              role="status"
              aria-live="polite"
            >
              <ResultCard title={aiCoach.result.summaryTitle}>
                <p className="text-pretty text-sm leading-[1.85] text-ink">{result.summary}</p>
              </ResultCard>

              <ResultCard title={aiCoach.result.bodyTitle}>
                <p className="text-pretty text-sm leading-[1.85] text-ink-muted">
                  {result.bodyFeedback}
                </p>
              </ResultCard>

              <ResultCard title={aiCoach.result.planTitle}>
                <ul className="flex flex-col gap-3">
                  {result.weeklyPlan.map((week) => (
                    <li
                      key={week.week}
                      className="flex flex-col gap-1 rounded-xl bg-surface-muted px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-medium text-white">
                          {week.week}주차
                        </span>
                        <span className="text-sm font-semibold text-ink">{week.sessions}</span>
                        <span className="text-sm text-ink-muted">· {week.perSession}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-ink-muted">{week.note}</p>
                    </li>
                  ))}
                </ul>
              </ResultCard>

              <ResultCard title={aiCoach.result.timeTitle}>
                <p className="font-display text-base text-brand-600 dark:text-brand-300">
                  {result.bestTime.slot}
                </p>
                <p className="mt-1 text-pretty text-sm leading-[1.85] text-ink-muted">
                  {result.bestTime.reason}
                </p>
              </ResultCard>

              <div className="grid gap-4 sm:grid-cols-2">
                <ResultCard title={aiCoach.result.injuryTitle}>
                  <TipList items={result.injuryTips} />
                </ResultCard>
                <ResultCard title={aiCoach.result.cautionTitle}>
                  <TipList items={result.cautions} />
                </ResultCard>
              </div>

              <p className="px-2 text-center text-[11px] leading-relaxed text-ink-muted">
                {aiCoach.disclaimer}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* --- 작은 조각들 --------------------------------------------------------- */

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-soft rounded-2xl border border-line bg-surface p-6">
      <h3 className="font-display mb-3 text-sm text-ink-muted">{title}</h3>
      {children}
    </div>
  );
}

function TipList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-[1.8] text-ink-muted">
          <span aria-hidden="true" className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-brand-400" />
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  );
}

type NumberFieldProps = {
  id: string;
  label: string;
  unit: string;
  placeholder: string;
  optional?: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<CoachFormValues>>["register"]>;
};

function NumberField({
  id,
  label,
  unit,
  placeholder,
  optional,
  error,
  registration,
}: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional ? (
          <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-muted">
            {optional}
          </span>
        ) : (
          <span className="ml-1 text-brand-400" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(inputClass(Boolean(error)), "pr-12")}
          {...registration}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-muted"
        >
          {unit}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* --- 폼 요소 공통 스타일 ------------------------------------------------ */
const errorClass = "text-xs font-medium text-accent-600 dark:text-accent-400";
const hintClass = "text-xs leading-relaxed text-ink-muted";

function inputClass(hasError: boolean): string {
  return cn(
    "w-full rounded-xl border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 transition-colors",
    hasError ? "border-accent-500" : "border-line focus:border-brand-400",
  );
}
