/**
 * utils.ts — 여러 컴포넌트에서 함께 쓰는 작은 도구 모음입니다.
 */

/** 조건부 클래스 이름을 안전하게 합쳐줍니다. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** 마감 시간이 지났는지 여부 */
  isOver: boolean;
};

/**
 * 마감 시각까지 남은 시간을 계산합니다. (카운트다운 타이머용)
 * @param deadlineIso data/challenge.ts 의 challengeInfo.deadline 값
 * @param now 테스트에서 시간을 고정할 수 있도록 주입받습니다.
 */
export function getTimeLeft(deadlineIso: string, now: number = Date.now()): TimeLeft {
  const diff = new Date(deadlineIso).getTime() - now;

  if (!Number.isFinite(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }

  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isOver: false,
  };
}

/** 한 자리 숫자를 09 처럼 두 자리로 맞춰줍니다. */
export function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}
