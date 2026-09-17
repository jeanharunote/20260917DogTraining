/**
 * /api/coach/validate — 입력한 Gemini API 키가 쓸 수 있는 키인지 확인합니다.
 *
 * 글을 생성하지 않고 모델 정보만 조회하므로 사용량(토큰)이 들지 않습니다.
 * 키가 맞는지와, 설정한 모델을 쓸 수 있는지를 한 번에 확인할 수 있습니다.
 *
 * 키는 확인에만 쓰고 저장하거나 로그로 남기지 않습니다.
 */
import { NextResponse } from "next/server";

import { aiCoach } from "@/data/challenge";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { apiKey?: unknown };

  try {
    body = (await request.json()) as { apiKey?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "확인할 API 키를 입력해 주세요." },
      { status: 400 },
    );
  }

  // 붙여넣기 실수(따옴표, 공백, 줄바꿈 포함)를 먼저 걸러 안내합니다.
  if (/\s/.test(apiKey) || apiKey.includes('"') || apiKey.includes("'")) {
    return NextResponse.json(
      {
        ok: false,
        error: "키에 공백이나 따옴표가 섞여 있어요. 키만 정확히 붙여넣어 주세요.",
      },
      { status: 400 },
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${aiCoach.model}`,
      { method: "GET", headers: { "x-goog-api-key": apiKey } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "확인 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  if (response.ok) {
    return NextResponse.json({ ok: true, model: aiCoach.model });
  }

  const detail = (await response.json().catch(() => null)) as {
    error?: { message?: string; details?: Array<{ reason?: string }> };
  } | null;

  const reason = detail?.error?.details?.find((item) => item.reason)?.reason ?? "";
  const rawMessage = detail?.error?.message ?? "";

  console.error(
    `[api/coach/validate] 키 확인 실패 (status: ${response.status}, reason: ${reason})`,
    rawMessage,
  );

  if (response.status === 404) {
    return NextResponse.json(
      {
        ok: false,
        error: `키는 정상이지만 모델(${aiCoach.model})을 쓸 수 없습니다. data/challenge.ts 의 aiCoach.model 값을 확인해 주세요.`,
      },
      { status: 404 },
    );
  }

  const isKeyProblem =
    reason === "API_KEY_INVALID" ||
    response.status === 401 ||
    response.status === 403 ||
    rawMessage.toLowerCase().includes("api key");

  return NextResponse.json(
    {
      ok: false,
      error: isKeyProblem
        ? "이 키로는 접속할 수 없어요. Google AI Studio 에서 키를 다시 확인하거나 새로 발급해 주세요."
        : "키를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    },
    { status: response.status },
  );
}
