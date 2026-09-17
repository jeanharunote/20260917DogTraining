/**
 * SignupForm 렌더링 테스트.
 * 필수 항목을 비운 채 제출했을 때 화면에 에러 메시지가 실제로 보이는지 확인합니다.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "@/components/SignupForm";

describe("SignupForm", () => {
  beforeEach(() => {
    // 실제 Formspree 주소 대신 테스트용 주소를 넣어둡니다.
    vi.stubEnv("NEXT_PUBLIC_FORMSPREE_ENDPOINT", "https://formspree.io/f/test-endpoint");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("빈 폼을 제출하면 필수 항목 에러가 화면에 노출된다", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole("button", { name: /참가 신청하기/ }));

    const alerts = await screen.findAllByRole("alert");

    // 이름 / 이메일 / 연락처 / 러닝 경력 / 개인정보 동의 = 5개
    expect(alerts).toHaveLength(5);
    expect(screen.getByText("이름을 알려주세요.")).toBeInTheDocument();
    expect(screen.getByText("연락처를 알려주세요.")).toBeInTheDocument();
  });

  it("에러가 난 입력칸에는 aria-invalid 가 표시된다", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole("button", { name: /참가 신청하기/ }));

    await waitFor(() => {
      expect(screen.getByLabelText(/이름/)).toHaveAttribute("aria-invalid", "true");
    });
    expect(screen.getByLabelText(/이메일/)).toHaveAttribute("aria-invalid", "true");
  });

  it("개인정보 동의만 체크하지 않아도 제출되지 않는다", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<SignupForm />);

    await user.type(screen.getByLabelText(/이름/), "홍길동");
    await user.type(screen.getByLabelText(/이메일/), "runner@example.com");
    await user.type(screen.getByLabelText(/연락처/), "010-1234-5678");
    await user.click(screen.getByRole("radio", { name: /안 해봤어요/ }));
    await user.click(screen.getByRole("button", { name: /참가 신청하기/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("동의");
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it("모든 항목을 올바르게 채우면 성공 메시지가 보인다", async () => {
    const user = userEvent.setup();
    // 실제 네트워크 호출 대신 성공 응답을 흉내 냅니다.
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    render(<SignupForm />);

    await user.type(screen.getByLabelText(/이름/), "홍길동");
    await user.type(screen.getByLabelText(/이메일/), "runner@example.com");
    await user.type(screen.getByLabelText(/연락처/), "010-1234-5678");
    await user.click(screen.getByRole("radio", { name: /안 해봤어요/ }));
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /참가 신청하기/ }));

    expect(await screen.findByText(/신청이 접수됐어요/)).toBeInTheDocument();

    fetchSpy.mockRestore();
  });
});
