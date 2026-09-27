/**
 * 구글폼 모드 테스트.
 * data/challenge.ts 의 signup.mode 가 "google" 일 때
 * 페이지 안에 입력칸을 만들지 않고 구글폼 링크만 보여주는지 확인합니다.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SignupForm } from "@/components/SignupForm";
import { signup } from "@/data/challenge";

describe("SignupForm — 구글폼 모드", () => {
  it("기본 설정은 구글폼 모드다", () => {
    expect(signup.mode).toBe("google");
  });

  it("구글폼 버튼이 새 창으로 열리는 링크로 보인다", () => {
    render(<SignupForm />);

    const link = screen.getByRole("link", { name: new RegExp(signup.google.buttonLabel) });

    expect(link).toHaveAttribute("href", signup.googleFormUrl);
    expect(link).toHaveAttribute("target", "_blank");
    // 새 창으로 열 때의 보안 속성이 빠지지 않았는지 확인합니다.
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("페이지 안에 이름·이메일 입력칸을 만들지 않는다", () => {
    render(<SignupForm />);

    expect(screen.queryByLabelText(/이름/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/이메일/)).not.toBeInTheDocument();
  });

  it("신청 요약 정보(기간·마감·인원·참가비)를 보여준다", () => {
    render(<SignupForm />);

    signup.summary.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });
});
