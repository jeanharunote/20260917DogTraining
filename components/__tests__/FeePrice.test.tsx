/**
 * 참가비 표시 테스트 — "정가 50,000원(취소선) → 1기 한정 30,000원(강조)"
 * 그리고 입금 안내의 실제 입금액은 30,000원 한 가지만 보여야 합니다.
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ApplyPage from "@/app/(app)/apply/page";
import { FAQ } from "@/components/FAQ";
import { FeePrice, WithFee } from "@/components/FeePrice";
import { Hero } from "@/components/Hero";
import { SignupForm } from "@/components/SignupForm";
import { challengeInfo, faq, FEE_TOKEN } from "@/data/challenge";

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: { uid: "u1", displayName: "홍길동" },
    loading: false,
    isAdmin: false,
    isParticipant: false,
    refreshEnrollment: vi.fn(),
    enrollment: {
      id: "cohort-1_u1",
      uid: "u1",
      cohortId: "cohort-1",
      name: "홍길동",
      email: "a@example.com",
      phone: "010-0000-0000",
      course: "beginner",
      agree: true,
      status: "pending",
    },
  }),
}));

/** 화면 안의 정가(취소선)와 특가(강조)를 확인합니다. */
function expectFeeDisplay(container: HTMLElement) {
  const regular = container.querySelector("del");
  expect(regular).toHaveTextContent("정가 50,000원");

  const special = container.querySelector("strong");
  expect(special).toHaveTextContent("1기 한정 30,000원");
}

describe("참가비 금액 설정", () => {
  it("실제 입금액은 30,000원, 정가는 50,000원이다", () => {
    expect(challengeInfo.feeText).toBe("30,000원");
    expect(challengeInfo.regularFeeText).toBe("50,000원");
    expect(challengeInfo.feeNote).toContain("대회 참가비 별도");
  });
});

describe("FeePrice", () => {
  it("정가에 취소선, 1기 한정가를 강조해서 보여준다", () => {
    const { container } = render(<FeePrice />);
    expectFeeDisplay(container);
  });

  it("문장 속 {{참가비}} 표시를 취소선 표시로 바꾼다", () => {
    const { container } = render(<WithFee text={`참가비는 ${FEE_TOKEN}이에요.`} />);
    expectFeeDisplay(container);
    expect(container).not.toHaveTextContent(FEE_TOKEN);
  });
});

describe("참가비가 보이는 곳마다 특가 표시", () => {
  it("히어로", () => {
    const { container } = render(<Hero />);
    expectFeeDisplay(container);
  });

  it("하단 신청 섹션", () => {
    const { container } = render(<SignupForm />);
    expectFeeDisplay(container);
  });

  it("FAQ 에 {{참가비}} 표시가 글자 그대로 남지 않는다", () => {
    const { container } = render(<FAQ />);
    expect(container).not.toHaveTextContent(FEE_TOKEN);
    expect(faq.items.some((item) => item.answer.includes(FEE_TOKEN))).toBe(true);
  });

  it("/apply 상단 안내", () => {
    render(<ApplyPage />);
    const header = screen.getByRole("banner");
    expectFeeDisplay(header);
    expect(header).toHaveTextContent("대회 참가비 별도");
  });
});

describe("입금 안내", () => {
  it("입금액은 특가 표시가 아니라 30,000원 한 가지 금액이다", () => {
    render(<ApplyPage />);

    const amount = screen.getByText("입금액").nextElementSibling as HTMLElement;
    expect(amount).toHaveTextContent(/^30,000원$/);
    expect(within(amount).queryByText(/50,000/)).not.toBeInTheDocument();
  });

  it("입금 안내 어디에도 50,000원이 입금 금액으로 나오지 않는다", () => {
    render(<ApplyPage />);

    const card = screen.getByText("참가비 입금 안내").closest("section") as HTMLElement;
    expect(card).not.toHaveTextContent("50,000");
  });
});
