/**
 * 신청 폼 검증 규칙(lib/schema.ts) 단위 테스트.
 * 필수 항목을 비웠을 때 안내 메시지가 생기는지 확인합니다.
 */
import { describe, expect, it } from "vitest";

import { signupDefaultValues, signupSchema } from "@/lib/schema";

/** 검증 에러를 { 필드명: 메시지 } 형태로 바꿔주는 헬퍼입니다. */
function collectErrors(values: unknown): Record<string, string> {
  const result = signupSchema.safeParse(values);

  if (result.success) return {};

  return Object.fromEntries(
    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  );
}

const validValues = {
  name: "홍길동",
  email: "runner@example.com",
  phone: "010-1234-5678",
  career: "none",
  motivation: "올해는 러닝을 습관으로 만들고 싶어요.",
  agree: true,
};

describe("signupSchema — 필수 항목 미입력", () => {
  it("빈 폼(초기값)을 제출하면 필수 항목 4개 모두에서 에러가 난다", () => {
    const errors = collectErrors(signupDefaultValues);

    expect(Object.keys(errors).sort()).toEqual(["agree", "career", "email", "name", "phone"].sort());
  });

  it("이름을 비우면 이름 안내 메시지가 나온다", () => {
    const errors = collectErrors({ ...validValues, name: "" });

    expect(errors.name).toBe("이름을 알려주세요.");
  });

  it("공백만 입력한 이름도 미입력으로 처리한다", () => {
    const errors = collectErrors({ ...validValues, name: "   " });

    expect(errors.name).toBeDefined();
  });

  it("이메일을 비우면 이메일 안내 메시지가 나온다", () => {
    const errors = collectErrors({ ...validValues, email: "" });

    expect(errors.email).toContain("이메일");
  });

  it("연락처를 비우면 연락처 안내 메시지가 나온다", () => {
    const errors = collectErrors({ ...validValues, phone: "" });

    expect(errors.phone).toBe("연락처를 알려주세요.");
  });

  it("러닝 경력을 고르지 않으면 선택 안내 메시지가 나온다", () => {
    const errors = collectErrors({ ...validValues, career: "" });

    expect(errors.career).toBeDefined();
  });

  it("개인정보 동의에 체크하지 않으면 에러가 난다", () => {
    const errors = collectErrors({ ...validValues, agree: false });

    expect(errors.agree).toContain("동의");
  });
});

describe("signupSchema — 형식 검증", () => {
  it("이메일 형식이 아니면 형식 안내 메시지가 나온다", () => {
    const errors = collectErrors({ ...validValues, email: "runner-at-example" });

    expect(errors.email).toContain("형식");
  });

  it.each(["010-1234-5678", "01012345678", "010 1234 5678", "011-123-4567"])(
    "휴대폰 번호 %s 는 통과한다",
    (phone) => {
      expect(collectErrors({ ...validValues, phone }).phone).toBeUndefined();
    },
  );

  it.each(["1234", "02-123-4567", "010-12-34"])("잘못된 번호 %s 는 걸러낸다", (phone) => {
    expect(collectErrors({ ...validValues, phone }).phone).toBeDefined();
  });

  it("참가 동기는 선택 항목이라 비워도 통과한다", () => {
    expect(signupSchema.safeParse({ ...validValues, motivation: "" }).success).toBe(true);
  });

  it("참가 동기가 500자를 넘으면 에러가 난다", () => {
    const errors = collectErrors({ ...validValues, motivation: "가".repeat(501) });

    expect(errors.motivation).toBeDefined();
  });
});

describe("signupSchema — 정상 입력", () => {
  it("모든 필수 항목을 채우면 통과한다", () => {
    const result = signupSchema.safeParse(validValues);

    expect(result.success).toBe(true);
  });

  it("이름과 이메일의 앞뒤 공백은 자동으로 정리된다", () => {
    const result = signupSchema.safeParse({
      ...validValues,
      name: "  홍길동  ",
      email: "  runner@example.com  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("홍길동");
      expect(result.data.email).toBe("runner@example.com");
    }
  });
});
