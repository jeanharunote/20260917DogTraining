/**
 * coach-schema.ts — AI 러닝 코치 입력값 검증과 응답 형태를 정의합니다.
 *
 * 입력 검증은 zod 로, AI 응답은 Gemini 의 구조화 출력(responseSchema)으로
 * 형태를 고정해서 화면에 안전하게 그릴 수 있게 합니다.
 */
import { z } from "zod";

import { aiCoach, signup } from "@/data/challenge";

export type ExperienceValue = (typeof signup.careerOptions)[number]["value"];
export type TimeValue = (typeof aiCoach.timeOptions)[number]["value"];

const experienceValues = signup.careerOptions.map((o) => o.value) as [
  ExperienceValue,
  ...ExperienceValue[],
];

const timeValues = aiCoach.timeOptions.map((o) => o.value) as [TimeValue, ...TimeValue[]];

/** 숫자 입력칸은 문자열로 들어오므로 숫자로 바꾼 뒤 범위를 확인합니다. */
function numberField(options: { min: number; max: number; emptyMessage: string; rangeMessage: string }) {
  return z
    .string()
    .trim()
    .min(1, { message: options.emptyMessage })
    .transform(Number)
    .pipe(
      z
        .number({ message: options.rangeMessage })
        .min(options.min, { message: options.rangeMessage })
        .max(options.max, { message: options.rangeMessage }),
    );
}

export const coachSchema = z.object({
  height: numberField({
    min: 120,
    max: 230,
    emptyMessage: "키를 알려주세요.",
    rangeMessage: "키는 120~230cm 사이로 입력해 주세요.",
  }),
  weight: numberField({
    min: 30,
    max: 200,
    emptyMessage: "체중을 알려주세요.",
    rangeMessage: "체중은 30~200kg 사이로 입력해 주세요.",
  }),
  /** 나이는 선택 항목이라 비워도 됩니다. */
  age: z
    .union([
      z.literal(""),
      z
        .string()
        .transform(Number)
        .pipe(
          z
            .number({ message: "나이는 10~100 사이로 입력해 주세요." })
            .min(10, { message: "나이는 10~100 사이로 입력해 주세요." })
            .max(100, { message: "나이는 10~100 사이로 입력해 주세요." }),
        ),
    ])
    .optional(),
  experience: z.enum(experienceValues, {
    message: "러닝 경험을 골라주세요. 어떤 선택도 괜찮아요.",
  }),
  daysPerWeek: numberField({
    min: 1,
    max: 7,
    emptyMessage: "일주일에 며칠 뛸 수 있는지 알려주세요.",
    rangeMessage: "1~7 사이로 입력해 주세요.",
  }),
  preferredTime: z.enum(timeValues, { message: "선호하는 시간대를 골라주세요." }),
  concern: z
    .string()
    .trim()
    .max(300, { message: "300자 이내로 적어주세요." })
    .optional()
    .or(z.literal("")),
});

export type CoachFormValues = z.input<typeof coachSchema>;

/**
 * 서버(/api/coach)가 받는 최종 형태입니다.
 * 폼에서는 문자열로 입력받아 숫자로 바꿔 보내므로, 서버는 숫자 기준으로 다시 확인합니다.
 */
export const coachPayloadSchema = z.object({
  height: z.number().min(120).max(230),
  weight: z.number().min(30).max(200),
  age: z.union([z.number().min(10).max(100), z.literal("")]).optional(),
  experience: z.enum(experienceValues),
  daysPerWeek: z.number().min(1).max(7),
  preferredTime: z.enum(timeValues),
  concern: z.string().max(300).optional(),
});

export type CoachPayload = z.infer<typeof coachPayloadSchema>;

export const coachDefaultValues: CoachFormValues = {
  height: "",
  weight: "",
  age: "",
  experience: "" as ExperienceValue,
  daysPerWeek: "3",
  preferredTime: "" as TimeValue,
  concern: "",
};

/* ===========================================================================
 * AI 응답 형태
 * ======================================================================== */
export type CoachPlanWeek = {
  week: number;
  sessions: string;
  perSession: string;
  note: string;
};

export type CoachResult = {
  summary: string;
  bodyFeedback: string;
  weeklyPlan: CoachPlanWeek[];
  bestTime: { slot: string; reason: string };
  injuryTips: string[];
  cautions: string[];
};

/** 화면에 그리기 전에 AI 응답이 기대한 형태인지 한 번 더 확인합니다. */
export const coachResultSchema = z.object({
  summary: z.string().min(1),
  bodyFeedback: z.string().min(1),
  weeklyPlan: z
    .array(
      z.object({
        week: z.number(),
        sessions: z.string(),
        perSession: z.string(),
        note: z.string(),
      }),
    )
    .min(1),
  bestTime: z.object({ slot: z.string(), reason: z.string() }),
  injuryTips: z.array(z.string()).min(1),
  cautions: z.array(z.string()).min(1),
});

/**
 * Gemini 에게 넘길 구조화 출력 스키마입니다.
 * (Gemini 는 OpenAPI 형식의 스키마를 받습니다.)
 */
export const geminiResponseSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    bodyFeedback: { type: "string" },
    weeklyPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          week: { type: "integer" },
          sessions: { type: "string" },
          perSession: { type: "string" },
          note: { type: "string" },
        },
        required: ["week", "sessions", "perSession", "note"],
      },
    },
    bestTime: {
      type: "object",
      properties: { slot: { type: "string" }, reason: { type: "string" } },
      required: ["slot", "reason"],
    },
    injuryTips: { type: "array", items: { type: "string" } },
    cautions: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "bodyFeedback", "weeklyPlan", "bestTime", "injuryTips", "cautions"],
} as const;

/** 키와 체중으로 BMI 를 계산합니다. (AI 에게 참고값으로 전달) */
export function calculateBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;

  return Number((weightKg / (heightM * heightM)).toFixed(1));
}
