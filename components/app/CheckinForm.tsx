"use client";

/** CheckinForm — 오늘의 러닝을 인증합니다. (날짜 · 거리 · 시간 · 메모, 하루 한 번) */
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Card, inputClass, Notice, primaryButton } from "@/components/app/ui";
import { challengeInfo } from "@/data/challenge";
import { addCheckin, type CourseValue } from "@/lib/data";
import { checkinSchema, type CheckinFormValues, type CheckinPayload } from "@/lib/schema";
import { cn } from "@/lib/utils";

type Props = {
  uid: string;
  displayName: string;
  course: CourseValue;
  today: string;
  /** 이미 인증한 날짜들 — 같은 날 두 번 올리지 않게 막습니다. */
  doneDates: string[];
  onSaved: () => Promise<void>;
};

export function CheckinForm({ uid, displayName, course, today, doneDates, onSaved }: Props) {
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  // 인증 가능한 날짜: 챌린지 시작일 ~ (오늘과 종료일 중 이른 날)
  const maxDate = today < challengeInfo.endDate ? today : challengeInfo.endDate;
  const defaultDate = today >= challengeInfo.startDate && today <= challengeInfo.endDate ? today : maxDate;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckinFormValues, unknown, CheckinPayload>({
    resolver: zodResolver(checkinSchema),
    defaultValues: { date: defaultDate, distanceKm: "", minutes: "", memo: "" },
  });

  const onSubmit = async (values: CheckinPayload) => {
    setMessage(null);

    if (values.date < challengeInfo.startDate || values.date > maxDate) {
      setMessage({ tone: "error", text: "챌린지 기간 안의 날짜만 인증할 수 있어요." });

      return;
    }

    if (doneDates.includes(values.date)) {
      setMessage({ tone: "error", text: "이 날짜는 이미 인증했어요. 하루에 한 번만 올릴 수 있어요." });

      return;
    }

    try {
      await addCheckin({
        uid,
        date: values.date,
        distanceKm: Math.round(values.distanceKm * 100) / 100,
        minutes: typeof values.minutes === "number" ? values.minutes : undefined,
        memo: values.memo || undefined,
        displayName,
        course,
      });
      reset({ date: defaultDate, distanceKm: "", minutes: "", memo: "" });
      setMessage({ tone: "success", text: "인증 완료! 오늘도 해냈어요 👏" });
      await onSaved();
    } catch (error) {
      console.error("[CheckinForm] 인증 저장 실패", error);
      setMessage({ tone: "error", text: "인증을 저장하지 못했어요. 잠시 후 다시 시도해 주세요." });
    }
  };

  return (
    <Card title="러닝 인증하기">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="checkin-date" className="text-xs font-semibold text-ink">
              날짜
            </label>
            <input
              id="checkin-date"
              type="date"
              min={challengeInfo.startDate}
              max={maxDate}
              className={cn(inputClass, errors.date && "border-accent-500")}
              {...register("date")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="checkin-distance" className="text-xs font-semibold text-ink">
              거리 (km)
            </label>
            <input
              id="checkin-distance"
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="3.5"
              aria-invalid={errors.distanceKm ? "true" : "false"}
              className={cn(inputClass, errors.distanceKm && "border-accent-500")}
              {...register("distanceKm")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="checkin-minutes" className="text-xs font-semibold text-ink">
              시간 (분) <span className="font-normal text-ink-muted">선택</span>
            </label>
            <input
              id="checkin-minutes"
              type="number"
              inputMode="numeric"
              placeholder="25"
              aria-invalid={errors.minutes ? "true" : "false"}
              className={cn(inputClass, errors.minutes && "border-accent-500")}
              {...register("minutes")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="checkin-memo" className="text-xs font-semibold text-ink">
            한 줄 메모 <span className="font-normal text-ink-muted">선택 · 피드에 함께 보여요</span>
          </label>
          <input
            id="checkin-memo"
            placeholder="예: 비 와서 걷다 뛰다 했지만 완료!"
            className={cn(inputClass, errors.memo && "border-accent-500")}
            {...register("memo")}
          />
        </div>

        {[errors.date, errors.distanceKm, errors.minutes, errors.memo]
          .filter(Boolean)
          .slice(0, 1)
          .map((error) => (
            <p key={error?.message} role="alert" className="text-xs font-medium text-accent-600 dark:text-accent-400">
              {error?.message}
            </p>
          ))}

        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

        <button type="submit" disabled={isSubmitting} className={primaryButton}>
          {isSubmitting ? "저장하는 중..." : "인증 올리기"}
        </button>
      </form>
    </Card>
  );
}
