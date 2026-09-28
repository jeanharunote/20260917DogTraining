/**
 * lib/data.ts 의 계산 도우미 테스트.
 * 문서 ID 규칙은 firestore.rules 와 반드시 같아야 하므로 특히 중요합니다.
 */
import { describe, expect, it } from "vitest";

import { challengeInfo } from "@/data/challenge";
import {
  checkinId,
  enrollmentId,
  isAdminEmail,
  isWithinChallenge,
  summarize,
  todayKST,
  weekIndexOf,
  type Checkin,
} from "@/lib/data";

const make = (date: string, distanceKm: number): Checkin => ({
  id: `x_${date}`,
  uid: "u",
  cohortId: challengeInfo.cohortId,
  date,
  distanceKm,
  displayName: "러너",
});

describe("문서 ID 규칙 (firestore.rules 와 일치해야 함)", () => {
  it("신청서 ID 는 {기수}_{UID}", () => {
    expect(enrollmentId("abc")).toBe(`${challengeInfo.cohortId}_abc`);
  });

  it("인증 ID 는 {기수}_{UID}_{날짜} — 하루 한 번 규칙의 근거", () => {
    expect(checkinId("abc", "2026-10-06")).toBe(`${challengeInfo.cohortId}_abc_2026-10-06`);
  });
});

describe("todayKST — 한국 시간 기준 날짜", () => {
  it("UTC 자정 직전이면 한국은 이미 다음 날이다", () => {
    // UTC 2026-10-05 20:00 = KST 2026-10-06 05:00
    expect(todayKST(new Date("2026-10-05T20:00:00Z"))).toBe("2026-10-06");
  });

  it("UTC 오전이면 한국도 같은 날이다", () => {
    expect(todayKST(new Date("2026-10-05T01:00:00Z"))).toBe("2026-10-05");
  });
});

describe("isWithinChallenge — 인증 가능 기간", () => {
  it("시작일과 종료일 당일은 포함한다", () => {
    expect(isWithinChallenge(challengeInfo.startDate)).toBe(true);
    expect(isWithinChallenge(challengeInfo.endDate)).toBe(true);
  });

  it("시작 전날과 종료 다음 날은 제외한다", () => {
    expect(isWithinChallenge("2026-10-04")).toBe(false);
    expect(isWithinChallenge("2026-11-02")).toBe(false);
  });
});

describe("weekIndexOf — 주차 계산 (시작일 월요일부터 7일씩)", () => {
  it.each([
    ["2026-10-05", 0],
    ["2026-10-11", 0],
    ["2026-10-12", 1],
    ["2026-10-25", 2],
    ["2026-10-26", 3],
    ["2026-11-01", 3],
  ])("%s 는 %i번째 주(0부터)", (date, week) => {
    expect(weekIndexOf(date)).toBe(week);
  });

  it("기간 밖의 날짜는 주차가 없다", () => {
    expect(weekIndexOf("2026-10-04")).toBeNull();
    expect(weekIndexOf("2026-11-02")).toBeNull();
  });
});

/** 각 주에 원하는 만큼 인증을 만듭니다. counts = [1주차, 2주차, 3주차, 4주차] */
const weeksOf = (counts: number[]) => {
  const start = new Date("2026-10-05T00:00:00Z");

  return counts.flatMap((count, week) =>
    Array.from({ length: count }, (_, day) => {
      const date = new Date(start.getTime() + (week * 7 + day) * 86400000).toISOString().slice(0, 10);

      return make(date, 3);
    }),
  );
};

describe("summarize — 진행률과 보증금 환급 (매주 4회 규칙)", () => {
  it("기록이 없으면 0%", () => {
    expect(summarize([])).toMatchObject({ count: 0, percent: 0, totalKm: 0, completed: false });
  });

  it("주차별 인증 횟수를 센다", () => {
    expect(summarize(weeksOf([4, 2, 0, 1])).weekly).toEqual([4, 2, 0, 1]);
  });

  it("4주 모두 주 4회를 채우면 환급 대상, 100%", () => {
    const result = summarize(weeksOf([4, 4, 4, 4]));

    expect(result.completed).toBe(true);
    expect(result.percent).toBe(100);
  });

  it("❌ 총 16회를 채워도 한 주가 3회면 환급 대상이 아니다 (몰아서 채우기 불가)", () => {
    const result = summarize(weeksOf([5, 4, 3, 4]));

    expect(result.total).toBe(16);
    expect(result.completed).toBe(false);
  });

  it("한 주에 4회를 넘게 해도 진행률에는 4회까지만 반영한다", () => {
    const result = summarize(weeksOf([7, 4, 3, 4]));

    expect(result.total).toBe(18);
    expect(result.count).toBe(15); // 4 + 4 + 3 + 4
    expect(result.percent).toBe(94);
    expect(result.completed).toBe(false);
  });

  it("거리는 소수 첫째 자리로 반올림한다", () => {
    expect(summarize([make("2026-10-05", 0.1), make("2026-10-06", 0.2)]).totalKm).toBe(0.3);
  });
});

describe("isAdminEmail — 화면에 관리자 메뉴를 보여줄지", () => {
  it("운영자 이메일이고 인증됐으면 관리자", () => {
    expect(isAdminEmail("runnursehigh@gmail.com", true)).toBe(true);
  });

  it("대소문자가 달라도 같은 이메일로 본다", () => {
    expect(isAdminEmail("RunNurseHigh@Gmail.com", true)).toBe(true);
  });

  it("인증되지 않은 이메일이면 아니다", () => {
    expect(isAdminEmail("runnursehigh@gmail.com", false)).toBe(false);
  });

  it("다른 이메일이거나 이메일이 없으면 아니다", () => {
    expect(isAdminEmail("someone@gmail.com", true)).toBe(false);
    expect(isAdminEmail(null, true)).toBe(false);
  });
});
