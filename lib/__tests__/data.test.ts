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

describe("summarize — 진행률", () => {
  it("기록이 없으면 0%", () => {
    expect(summarize([])).toMatchObject({ count: 0, percent: 0, totalKm: 0, completed: false });
  });

  it("횟수·거리·달성률을 계산한다", () => {
    const result = summarize([make("2026-10-05", 3.2), make("2026-10-06", 4.1)]);

    expect(result.count).toBe(2);
    expect(result.totalKm).toBe(7.3);
    expect(result.percent).toBe(Math.round((2 / challengeInfo.targetCheckins) * 100));
  });

  it("목표 횟수를 채우면 완주로 표시하고 100%를 넘지 않는다", () => {
    const many = Array.from({ length: challengeInfo.targetCheckins + 3 }, (_, i) =>
      make(`2026-10-${String(5 + i).padStart(2, "0")}`, 3),
    );
    const result = summarize(many);

    expect(result.completed).toBe(true);
    expect(result.percent).toBe(100);
  });

  it("부동소수점 오차 없이 소수 첫째 자리로 반올림한다", () => {
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
