/**
 * /api/coach — AI 러닝 코치 요청을 Gemini 로 중계하는 라우트입니다.
 *
 * 왜 서버를 거치나요?
 *   브라우저에서 Google API 를 직접 부르면 CORS 문제가 생길 수 있어서,
 *   이 라우트가 요청만 그대로 전달합니다.
 *
 * API 키 취급 원칙
 *   - 키는 방문자가 입력한 값을 이 요청에서만 사용합니다.
 *   - 서버에 저장하지 않고, 로그로도 남기지 않습니다.
 *   - 응답에도 키를 절대 포함하지 않습니다.
 */
import { NextResponse } from "next/server";

import { aiCoach, signup } from "@/data/challenge";
import {
  calculateBmi,
  coachPayloadSchema,
  geminiResponseSchema,
  type CoachPayload,
} from "@/lib/coach-schema";

/** 매 요청마다 새로 처리합니다. (캐시 금지) */
export const dynamic = "force-dynamic";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/** 러닝 코치의 말투와 원칙을 정해줍니다. */
const SYSTEM_INSTRUCTION = `당신은 러닝 초보자를 돕는 따뜻한 러닝 코치입니다.

지켜야 할 원칙:
- 한국어 존댓말로, 부담을 낮추는 다정한 말투를 씁니다. 몰아붙이거나 겁주지 않습니다.
- 초보자 기준으로 안전하게 설계합니다. 첫 주는 걷기를 섞은 낮은 강도에서 시작합니다.
- 주당 러닝 횟수는 사용자가 가능하다고 한 날수를 넘기지 않습니다. 회복일을 반드시 남깁니다.
- 키와 체중(BMI)은 강도를 조절하는 참고값으로만 쓰고, 외모나 체형을 평가하지 않습니다.
  살을 빼라는 식의 표현은 절대 쓰지 않습니다.
- 의학적 진단이나 치료를 단정하지 않습니다. 통증이 있으면 전문의 상담을 권합니다.
- 각 항목은 한국어로 2~3문장 이내로 간결하게 씁니다.`;

/** 사용자 정보를 코치가 읽기 좋은 문장으로 만듭니다. */
function buildPrompt(input: CoachPayload): string {
  const bmi = calculateBmi(input.height, input.weight);

  const experienceLabel =
    signup.careerOptions.find((o) => o.value === input.experience)?.label ?? input.experience;
  const timeLabel =
    aiCoach.timeOptions.find((o) => o.value === input.preferredTime)?.label ?? input.preferredTime;

  return [
    "아래 정보를 가진 분을 위해 4주짜리 러닝 습관 계획을 짜주세요.",
    "",
    `- 키: ${input.height}cm`,
    `- 체중: ${input.weight}kg (BMI ${bmi})`,
    input.age ? `- 나이: ${input.age}세` : "- 나이: 알려주지 않음",
    `- 러닝 경험: ${experienceLabel}`,
    `- 일주일에 뛸 수 있는 날: ${input.daysPerWeek}일`,
    `- 선호하는 시간대: ${timeLabel}`,
    input.concern ? `- 걱정되는 점: ${input.concern}` : "- 걱정되는 점: 특별히 없음",
    "",
    "요청 사항:",
    "1. summary: 이 분에게 건네는 따뜻한 한마디 (2문장 이내)",
    "2. bodyFeedback: 키와 체중을 고려했을 때 어떤 강도로 시작하면 좋은지 (체형 평가 금지)",
    "3. weeklyPlan: 1~4주차 각각의 주당 횟수(sessions), 1회 운동량(perSession), 한 줄 조언(note)",
    `4. bestTime: 선호 시간대(${timeLabel})를 고려한 추천 운동 시간대와 그 이유`,
    "5. injuryTips: 부상 예방 팁 3가지",
    "6. cautions: 이 분이 특히 조심해야 할 점 2~3가지",
  ].join("\n");
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { apiKey, ...rest } = (body ?? {}) as Record<string, unknown>;

  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return NextResponse.json(
      { error: "Gemini API 키를 입력해 주세요." },
      { status: 400 },
    );
  }

  const parsed = coachPayloadSchema.safeParse(rest);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요." },
      { status: 400 },
    );
  }

  let response: Response;

  try {
    response = await fetch(`${GEMINI_BASE}/${aiCoach.model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 키를 URL 이 아닌 헤더로 보냅니다. (주소창·로그에 남지 않도록)
        "x-goog-api-key": apiKey.trim(),
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text: buildPrompt(parsed.data) }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: geminiResponseSchema,
        },
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "AI 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const status = response.status;

    // Google 이 알려준 실패 이유를 꺼내 봅니다. (키 문제인지, 모델 이름 문제인지 구분용)
    const detail = (await response.json().catch(() => null)) as {
      error?: { message?: string; details?: Array<{ reason?: string }> };
    } | null;

    const reason = detail?.error?.details?.find((item) => item.reason)?.reason ?? "";
    const rawMessage = detail?.error?.message ?? "";

    // 운영자가 원인을 알 수 있도록 서버 로그에만 남깁니다. (키는 절대 로그에 남기지 않습니다)
    console.error(`[api/coach] Gemini 응답 실패 (status: ${status}, reason: ${reason})`, rawMessage);

    const isKeyProblem =
      reason === "API_KEY_INVALID" ||
      status === 401 ||
      status === 403 ||
      rawMessage.toLowerCase().includes("api key");

    const message = isKeyProblem
      ? "API 키가 올바르지 않거나 권한이 없습니다. 키를 다시 확인해 주세요."
      : status === 429
        ? "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
        : status === 404
          ? `모델(${aiCoach.model})을 찾을 수 없습니다. data/challenge.ts 의 aiCoach.model 값을 확인해 주세요.`
          : "AI 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.";

    return NextResponse.json({ error: message }, { status });
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";

  if (!text) {
    return NextResponse.json(
      { error: "AI 응답이 비어 있습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  try {
    // 구조화 출력이라 JSON 문자열로 돌아옵니다.
    return NextResponse.json({ result: JSON.parse(text) });
  } catch {
    return NextResponse.json(
      { error: "AI 응답을 이해하지 못했습니다. 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
