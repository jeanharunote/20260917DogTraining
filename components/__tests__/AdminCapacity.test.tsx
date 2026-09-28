/**
 * 관리자 페이지 — 선착순(입금 확인 순서) 정원 안내 테스트
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminPage from "@/app/(app)/admin/page";
import { challengeInfo } from "@/data/challenge";
import type { Enrollment } from "@/lib/data";

const listEnrollments = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ user: { uid: "admin" }, loading: false, isAdmin: true }),
}));

vi.mock("@/lib/data", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/data")>()),
  adminListEnrollments: listEnrollments,
  adminListCheckins: vi.fn().mockResolvedValue([]),
  adminGetParticipantChat: vi.fn().mockResolvedValue(null),
}));

const person = (index: number, status: Enrollment["status"]): Enrollment => ({
  id: `cohort-1_u${index}`,
  uid: `u${index}`,
  cohortId: "cohort-1",
  name: `참가자${index}`,
  email: `u${index}@example.com`,
  phone: "010-0000-0000",
  course: "beginner",
  agree: true,
  status,
});

const roster = (paid: number, pending: number) => [
  ...Array.from({ length: paid }, (_, i) => person(i, "paid")),
  ...Array.from({ length: pending }, (_, i) => person(100 + i, "pending")),
];

beforeEach(() => listEnrollments.mockReset());

describe("관리자 정원 안내 (선착순 = 입금 확인 순서)", () => {
  it("정원이 남아 있으면 남은 자리를 알려주고, 정원 마감 환불 버튼은 없다", async () => {
    listEnrollments.mockResolvedValue(roster(challengeInfo.capacity - 1, 2));
    render(<AdminPage />);

    expect(await screen.findByText(/남은 자리 1명/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "정원 마감 · 환불 처리" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "입금 확인 → 참가 확정" })).toHaveLength(2);
  });

  it("정원이 차면 안내가 바뀌고, 입금 대기자에게 정원 마감 환불 버튼이 생긴다", async () => {
    listEnrollments.mockResolvedValue(roster(challengeInfo.capacity, 2));
    render(<AdminPage />);

    expect(await screen.findByText(/정원 10명이 모두 찼어요/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "정원 마감 · 환불 처리" })).toHaveLength(2);
  });
});
