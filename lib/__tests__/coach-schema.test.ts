/**
 * AI 러닝 코치 입력 검증(lib/coach-schema.ts) 단위 테스트.
 */
import { describe, expect, it } from "vitest";

import {
  calculateBmi,
  coachPayloadSchema,
  coachResultSchema,
  coachSchema,
  coachDefaultValues,
} from "@/lib/coach-schema";

function collectErrors(values: unknown): Record<string, string> {
  const result = coachSchema.safeParse(values);

  if (result.success) return {};

  return Object.fromEntries(
    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  );
}

const validForm = {
  height: "165",
  weight: "58",
  age: "30",
  experience: "none",
  daysPerWeek: "3",
  preferredTime: "morning",
  concern: "무릎이 약한 편이에요",
};

describe("coachSchema — 필수 항목", () => {
  it("빈 폼을 제출하면 필수 항목에서 에러가 난다", () => {
    const errors = collectErrors(coachDefaultValues);

    expect(Object.keys(errors).sort()).toEqual(["experience", "height", "preferredTime", "weight"]);
  });

  it("키를 비우면 안내 메시지가 나온다", () => {
    expect(collectErrors({ ...validForm, height: "" }).height).toBe("키를 알려주세요.");
  });

  it("체중을 비우면 안내 메시지가 나온다", () => {
    expect(collectErrors({ ...validForm, weight: "" }).weight).toBe("체중을 알려주세요.");
  });

  it("시간대를 고르지 않으면 에러가 난다", () => {
    expect(collectErrors({ ...validForm, preferredTime: "" }).preferredTime).toBeDefined();
  });
});

describe("coachSchema — 범위 검증", () => {
  it.each([
    ["height", "80"],
    ["height", "300"],
    ["weight", "10"],
    ["weight", "500"],
    ["daysPerWeek", "0"],
    ["daysPerWeek", "9"],
  ])("%s 값 %s 는 범위를 벗어나 걸러낸다", (field, value) => {
    expect(collectErrors({ ...validForm, [field]: value })[field]).toBeDefined();
  });

  it("숫자가 아닌 키는 걸러낸다", () => {
    expect(collectErrors({ ...validForm, height: "백육십오" }).height).toBeDefined();
  });

  it("나이는 선택 항목이라 비워도 통과한다", () => {
    expect(coachSchema.safeParse({ ...validForm, age: "" }).success).toBe(true);
  });
});

describe("coachSchema — 변환 결과", () => {
  it("문자열 입력이 숫자로 바뀌어 서버로 전달된다", () => {
    const result = coachSchema.safeParse(validForm);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.height).toBe(165);
      expect(result.data.weight).toBe(58);
      expect(result.data.daysPerWeek).toBe(3);
    }
  });

  it("변환된 값은 서버 스키마도 통과한다", () => {
    const parsed = coachSchema.parse(validForm);

    expect(coachPayloadSchema.safeParse(parsed).success).toBe(true);
  });

  it("서버 스키마는 범위를 벗어난 값을 거부한다", () => {
    expect(
      coachPayloadSchema.safeParse({ ...coachSchema.parse(validForm), daysPerWeek: 99 }).success,
    ).toBe(false);
  });
});

describe("calculateBmi", () => {
  it("키와 체중으로 BMI 를 계산한다", () => {
    expect(calculateBmi(170, 65)).toBe(22.5);
    expect(calculateBmi(160, 50)).toBe(19.5);
  });
});

describe("coachResultSchema — AI 응답 검증", () => {
  const validResult = {
    summary: "천천히 시작해봐요.",
    bodyFeedback: "무리하지 않는 강도가 좋아요.",
    weeklyPlan: [{ week: 1, sessions: "주 3회", perSession: "20분", note: "걷기부터" }],
    bestTime: { slot: "아침", reason: "선호 시간대라서" },
    injuryTips: ["스트레칭하기"],
    cautions: ["통증이 있으면 쉬기"],
  };

  it("기대한 형태의 응답은 통과한다", () => {
    expect(coachResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("항목이 빠진 응답은 걸러낸다", () => {
    const broken: Record<string, unknown> = { ...validResult };
    delete broken.bestTime;

    expect(coachResultSchema.safeParse(broken).success).toBe(false);
  });

  it("주차 계획이 비어 있으면 걸러낸다", () => {
    expect(coachResultSchema.safeParse({ ...validResult, weeklyPlan: [] }).success).toBe(false);
  });
});
