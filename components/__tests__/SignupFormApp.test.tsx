/**
 * 앱 모드(기본값) 테스트 — 랜딩페이지 신청 섹션이 로그인 후 신청 페이지로 안내하는지 확인합니다.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SignupForm } from "@/components/SignupForm";
import { signup } from "@/data/challenge";

describe("SignupForm — 앱 모드 (기본값)", () => {
  it("기본 설정은 로그인 후 신청하는 앱 모드다", () => {
    expect(signup.mode).toBe("app");
  });

  it("신청 버튼이 /apply 로 연결된다", () => {
    render(<SignupForm />);

    expect(screen.getByRole("link", { name: new RegExp(signup.app.buttonLabel) })).toHaveAttribute(
      "href",
      "/apply",
    );
  });

  it("이미 신청한 사람을 위해 마이페이지 링크를 보여준다", () => {
    render(<SignupForm />);

    expect(screen.getByRole("link", { name: /마이페이지/ })).toHaveAttribute("href", "/me");
  });

  it("랜딩페이지에는 개인정보 입력칸을 두지 않는다", () => {
    render(<SignupForm />);

    expect(screen.queryByLabelText(/연락처/)).not.toBeInTheDocument();
  });
});
