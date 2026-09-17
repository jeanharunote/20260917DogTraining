"use client";

/** Countdown — 모집 마감까지 남은 시간을 1초마다 갱신해서 보여줍니다. */
import { useEffect, useState } from "react";

import { challengeInfo, hero } from "@/data/challenge";
import { getTimeLeft, padTwo, type TimeLeft } from "@/lib/utils";

const units: Array<{ key: keyof Omit<TimeLeft, "isOver">; label: string }> = [
  { key: "days", label: "일" },
  { key: "hours", label: "시간" },
  { key: "minutes", label: "분" },
  { key: "seconds", label: "초" },
];

export function Countdown() {
  // 서버와 브라우저의 시각이 달라 생기는 화면 깜빡임을 막기 위해
  // 처음에는 비워두고, 브라우저에서 마운트된 뒤에 계산을 시작합니다.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft(challengeInfo.deadline));

    update();
    const timerId = window.setInterval(update, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  if (timeLeft?.isOver) {
    return (
      <p className="rounded-2xl bg-white/15 px-5 py-4 text-center text-sm font-medium text-white backdrop-blur">
        {hero.countdownEndedText}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <p className="text-xs font-semibold tracking-wide text-white/80">
        {hero.countdownLabel}
        <span className="ml-2 font-normal text-white/60">({challengeInfo.deadlineText})</span>
      </p>

      <div
        className="flex items-center gap-2 sm:gap-3"
        // 1초마다 바뀌는 값이라 스크린리더가 계속 읽지 않도록 막고,
        // 아래 요약 문장만 한 번 읽어주도록 합니다.
        aria-hidden="true"
      >
        {units.map(({ key, label }) => (
          <div
            key={key}
            className="flex min-w-[4rem] flex-col items-center rounded-2xl bg-white/15 px-3 py-3 backdrop-blur sm:min-w-[4.5rem]"
          >
            <span className="tabular text-2xl font-bold text-white sm:text-3xl">
              {timeLeft ? padTwo(timeLeft[key]) : "--"}
            </span>
            <span className="mt-0.5 text-[11px] font-medium text-white/70">{label}</span>
          </div>
        ))}
      </div>

      {/* 스크린리더용 요약 문장 */}
      <p className="sr-only">
        {timeLeft
          ? `모집 마감까지 ${timeLeft.days}일 ${timeLeft.hours}시간 남았습니다.`
          : "모집 마감까지 남은 시간을 계산하고 있습니다."}
      </p>
    </div>
  );
}
