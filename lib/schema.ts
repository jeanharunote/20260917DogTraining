/**
 * schema.ts — 참가 신청 폼의 검증 규칙(zod 스키마)을 정의합니다.
 *
 * 에러 메시지는 "안심시키는 톤"을 유지해 주세요.
 * 몰아붙이는 표현("필수입니다!") 대신 부드러운 안내("~를 알려주세요")를 씁니다.
 */
import { z } from "zod";

import { signup } from "@/data/challenge";

/** data/challenge.ts 의 careerOptions(희망 코스) 값에서 선택지를 자동으로 가져옵니다. */
export type CareerValue = (typeof signup.careerOptions)[number]["value"];

const careerValues = signup.careerOptions.map((option) => option.value) as [
  CareerValue,
  ...CareerValue[],
];

/** 010-1234-5678, 01012345678, 010 1234 5678 형태를 모두 허용합니다. */
const phonePattern = /^01[016789][-\s]?\d{3,4}[-\s]?\d{4}$/;

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "이름을 알려주세요." })
    .max(30, { message: "이름은 30자 이내로 적어주세요." }),

  email: z
    .string()
    .trim()
    .min(1, { message: "안내 메일을 받으실 이메일을 알려주세요." })
    .pipe(z.email({ message: "이메일 형식을 한 번만 확인해 주세요. (예: runner@example.com)" })),

  // .pipe 를 쓰면 "비어 있음" 에러와 "형식이 틀림" 에러가 한 번에 뜨지 않고
  // 비어 있을 때는 비어 있다는 안내만 먼저 보여줄 수 있습니다.
  phone: z
    .string()
    .trim()
    .min(1, { message: "연락처를 알려주세요." })
    .pipe(
      z
        .string()
        .regex(phonePattern, { message: "휴대폰 번호 형식을 확인해 주세요. (예: 010-1234-5678)" }),
    ),

  career: z.enum(careerValues, {
    message: "희망하는 코스를 골라주세요. 중간에 바꿔도 괜찮아요.",
  }),

  /** 참가 동기는 선택 항목이라 비워 두어도 통과합니다. */
  motivation: z
    .string()
    .trim()
    .max(500, { message: "참가 동기는 500자 이내로 적어주세요." })
    .optional()
    .or(z.literal("")),

  agree: z.literal(true, {
    message: "개인정보 수집·이용에 동의해 주셔야 신청을 접수할 수 있어요.",
  }),
});

export type SignupFormValues = z.input<typeof signupSchema>;
export type SignupPayload = z.output<typeof signupSchema>;

/** react-hook-form 의 초기값입니다. */
export const signupDefaultValues: SignupFormValues = {
  name: "",
  email: "",
  phone: "",
  // 아무것도 선택되지 않은 상태로 두기 위해 의도적으로 빈 값을 사용합니다.
  career: "" as CareerValue,
  motivation: "",
  agree: false as unknown as true,
};

/* ===========================================================================
 * 러닝 인증 입력 검증
 * (firestore.rules 의 isValidCheckin 과 같은 기준을 화면에서도 미리 확인합니다)
 * ======================================================================== */
export const checkinSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "날짜를 골라주세요." }),
  distanceKm: z
    .string()
    .trim()
    .min(1, { message: "달린 거리를 알려주세요." })
    .transform(Number)
    .pipe(
      z
        .number({ message: "거리는 숫자로 적어주세요." })
        .gt(0, { message: "거리는 0보다 커야 해요." })
        .max(100, { message: "100km 이하로 적어주세요." }),
    ),
  minutes: z
    .union([
      z.literal(""),
      z
        .string()
        .transform(Number)
        .pipe(
          z
            .number({ message: "시간은 숫자로 적어주세요." })
            .int({ message: "분 단위 정수로 적어주세요." })
            .min(0, { message: "0분 이상으로 적어주세요." })
            .max(600, { message: "600분 이하로 적어주세요." }),
        ),
    ])
    .optional(),
  memo: z.string().trim().max(300, { message: "메모는 300자 이내로 적어주세요." }).optional(),
});

export type CheckinFormValues = z.input<typeof checkinSchema>;
export type CheckinPayload = z.output<typeof checkinSchema>;
