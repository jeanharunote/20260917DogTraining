/**
 * 참가 확정자 전용 오픈채팅 안내 테스트
 *
 * - 입금 대기: 링크·비밀번호가 화면에 아예 그려지지 않고, 불러오지도 않는다.
 * - 참가 확정: 입장 버튼(새 탭)과 비밀번호, 복사 버튼이 나타난다.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ApplyPage from "@/app/(app)/apply/page";
import MyPage from "@/app/(app)/me/page";
import type { Enrollment, ParticipantChat } from "@/lib/data";

const CHAT: ParticipantChat = { chatUrl: "https://open.kakao.com/o/test-room", chatPassword: "test-pw" };

const auth = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
const watchParticipantChat = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ useAuth: () => auth.current }));

vi.mock("@/lib/data", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/data")>()),
  watchParticipantChat,
  listMyCheckins: vi.fn().mockResolvedValue([]),
}));

const enrollment = (status: Enrollment["status"]): Enrollment => ({
  id: `cohort-1_u1`,
  uid: "u1",
  cohortId: "cohort-1",
  name: "홍길동",
  email: "a@example.com",
  phone: "010-0000-0000",
  course: "beginner",
  agree: true,
  status,
});

function signInAs(status: Enrollment["status"]) {
  auth.current = {
    user: { uid: "u1", displayName: "홍길동" },
    loading: false,
    isAdmin: false,
    enrollment: enrollment(status),
    isParticipant: status === "paid",
    refreshEnrollment: vi.fn(),
  };
}

beforeEach(() => {
  watchParticipantChat.mockReset();
  // 실제처럼: 구독하면 곧바로 링크 정보를 알려주고, 구독 해제 함수를 돌려줍니다.
  watchParticipantChat.mockImplementation((onChange: (chat: ParticipantChat | null) => void) => {
    onChange(CHAT);

    return () => undefined;
  });
});

describe.each([
  ["신청 페이지", ApplyPage],
  ["마이페이지", MyPage],
])("%s", (_name, Page) => {
  it("입금 대기일 때는 오픈채팅 링크와 비밀번호를 그리지도, 불러오지도 않는다", () => {
    signInAs("pending");
    const { container } = render(<Page />);

    expect(screen.queryByText("참가 확정 🎉")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "오픈채팅방 입장하기" })).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain(CHAT.chatUrl);
    expect(container.innerHTML).not.toContain(CHAT.chatPassword);
    expect(watchParticipantChat).not.toHaveBeenCalled();
  });

  it("참가 확정이면 입장 버튼(새 탭)과 비밀번호가 나타난다", async () => {
    signInAs("paid");
    render(<Page />);

    expect(await screen.findByText("참가 확정 🎉")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "오픈채팅방 입장하기" });
    expect(link).toHaveAttribute("href", CHAT.chatUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByTestId("chat-password")).toHaveTextContent(CHAT.chatPassword);
  });
});

describe("비밀번호 복사", () => {
  it("복사 버튼을 누르면 비밀번호가 클립보드에 들어간다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    signInAs("paid");
    render(<ApplyPage />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "입장 비밀번호 복사" }));
    });

    expect(writeText).toHaveBeenCalledWith(CHAT.chatPassword);
    expect(screen.getByRole("button", { name: "입장 비밀번호 복사" })).toHaveTextContent("복사됨");
  });
});

describe("관리자가 아직 링크를 저장하지 않았을 때", () => {
  it("준비 중 안내를 보여준다", async () => {
    watchParticipantChat.mockImplementation((onChange: (chat: ParticipantChat | null) => void) => {
      onChange(null);

      return () => undefined;
    });

    signInAs("paid");
    render(<ApplyPage />);

    expect(await screen.findByText(/오픈채팅방 안내를 준비하고 있어요/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "오픈채팅방 입장하기" })).not.toBeInTheDocument();
  });
});
