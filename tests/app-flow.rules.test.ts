/**
 * 실제 앱 코드(lib/data.ts) → 보안 규칙 통합 테스트
 *
 * firestore.rules.test.ts 는 손으로 만든 데이터로 규칙을 검사합니다.
 * 이 파일은 "앱이 실제로 저장하는 데이터 모양"이 규칙을 통과하는지 확인합니다.
 * 필드 하나만 어긋나도 운영에서 저장이 거부되므로, 한 사람의 여정을 그대로 따라가 봅니다.
 *
 *   신청 → (입금 전 인증 시도 실패) → 관리자 입금 확인 → 인증 → 피드 → 환불
 */
import { readFileSync } from "node:fs";

import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, type Firestore } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  addCheckin,
  adminListCheckins,
  adminGetParticipantChat,
  adminListEnrollments,
  adminSaveParticipantChat,
  adminSetStatus,
  checkIsAdmin,
  createEnrollment,
  deleteCheckin,
  enrollmentId,
  getMyEnrollment,
  listFeed,
  listMyCheckins,
  saveProfile,
  watchMyEnrollment,
  watchParticipantChat,
  type Enrollment,
  type ParticipantChat,
} from "@/lib/data";
import { __setTestDb } from "@/lib/firebase";

const RUNNER = "runner-uid";
const STRANGER = "stranger-uid";
const ADMIN = "admin-uid";

let env: RulesTestEnvironment;

/** 해당 사용자로 로그인한 상태로 앱 코드를 실행합니다. */
const as = (uid: string) => __setTestDb(env.authenticatedContext(uid).firestore() as unknown as Firestore);

const application = {
  uid: RUNNER,
  name: "김러너",
  email: "runner@example.com",
  phone: "010-1111-2222",
  course: "beginner" as const,
  motivation: "마라톤 나가보고 싶어요",
  agree: true as const,
};

const run = (date: string) => ({
  uid: RUNNER,
  date,
  distanceKm: 3.5,
  minutes: 24,
  memo: "완료!",
  displayName: "김러너",
  course: "beginner" as const,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-running-habit",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});

afterAll(async () => {
  __setTestDb(null);
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "admins", ADMIN), { note: "운영자" });
  });
});

describe("🏃 한 참가자의 여정 — 실제 앱 코드로", () => {
  it("로그인 → 신청 → 입금 확인 → 인증 → 피드 → 환불까지 전부 동작한다", async () => {
    // 1) 로그인하면 프로필을 저장한다
    as(RUNNER);
    await saveProfile({ uid: RUNNER, displayName: "김러너", email: "runner@example.com", photoURL: null });
    expect(await checkIsAdmin({ uid: RUNNER, email: "runner@example.com", emailVerified: true })).toBe(false);

    // 2) 신청하면 "입금 대기" 상태가 된다
    await createEnrollment(application);
    expect((await getMyEnrollment(RUNNER))?.status).toBe("pending");

    // 3) 입금 전에는 인증을 올릴 수 없다
    await expect(addCheckin(run("2026-10-05"))).rejects.toThrow();

    // 4) 관리자가 명단을 보고 입금을 확인한다
    as(ADMIN);
    expect(await checkIsAdmin({ uid: ADMIN, email: null, emailVerified: false })).toBe(true);
    const roster = await adminListEnrollments();
    expect(roster.map((item) => item.name)).toContain("김러너");
    await adminSetStatus(enrollmentId(RUNNER), "paid");

    // 5) 참가 확정 → 인증을 올릴 수 있다
    as(RUNNER);
    const enrollment = await getMyEnrollment(RUNNER);
    expect(enrollment?.status).toBe("paid");
    expect(enrollment?.paidAt).toBeInstanceOf(Date);

    await addCheckin(run("2026-10-05"));
    await addCheckin({ ...run("2026-10-06"), minutes: undefined, memo: undefined }); // 선택 항목 생략

    // 6) 같은 날 두 번은 올릴 수 없다 (덮어쓰기 = 수정 → 규칙이 거부)
    await expect(addCheckin({ ...run("2026-10-05"), distanceKm: 42 })).rejects.toThrow();

    // 7) 내 기록과 피드에 보인다
    const mine = await listMyCheckins(RUNNER);
    expect(mine.map((item) => item.date)).toEqual(["2026-10-06", "2026-10-05"]);
    expect(mine.find((item) => item.date === "2026-10-05")?.distanceKm).toBe(3.5);

    const feed = await listFeed();
    expect(feed).toHaveLength(2);

    // 8) 내 인증은 지울 수 있다
    await deleteCheckin(mine[0].id);
    expect(await listMyCheckins(RUNNER)).toHaveLength(1);

    // 9) 관리자는 인증 현황을 보고 환불 처리할 수 있다
    as(ADMIN);
    expect(await adminListCheckins()).toHaveLength(1);
    await adminSetStatus(enrollmentId(RUNNER), "refunded", "개인 사정으로 환불");

    // 10) 환불되면 더 이상 인증을 올리거나 피드를 볼 수 없다
    as(RUNNER);
    expect((await getMyEnrollment(RUNNER))?.status).toBe("refunded");
    await expect(addCheckin(run("2026-10-07"))).rejects.toThrow();
    await expect(listFeed()).rejects.toThrow();
  });
});

describe("🔐 실제 앱 코드로 시도하는 공격", () => {
  it("신청하지 않은 사람은 피드를 볼 수 없다", async () => {
    as(STRANGER);
    await expect(listFeed()).rejects.toThrow();
  });

  it("관리자가 아니면 명단 조회도, 상태 변경도 할 수 없다", async () => {
    as(RUNNER);
    await createEnrollment(application);

    as(STRANGER);
    await expect(adminListEnrollments()).rejects.toThrow();
    await expect(adminSetStatus(enrollmentId(RUNNER), "paid")).rejects.toThrow();

    // 본인도 자기 신청서를 결제 완료로 바꿀 수 없다
    as(RUNNER);
    await expect(adminSetStatus(enrollmentId(RUNNER), "paid")).rejects.toThrow();
    expect((await getMyEnrollment(RUNNER))?.status).toBe("pending");
  });

  it("한 사람이 같은 기수에 두 번 신청할 수 없다 (덮어쓰기 차단)", async () => {
    as(RUNNER);
    await createEnrollment(application);
    await expect(createEnrollment({ ...application, name: "다른이름" })).rejects.toThrow();
  });
});

/** 조건이 참이 될 때까지 기다립니다. (실시간 반영 확인용) */
async function eventually(check: () => boolean, timeoutMs = 5000) {
  const started = Date.now();

  while (!check()) {
    if (Date.now() - started > timeoutMs) throw new Error("시간 안에 반영되지 않았어요");
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

describe("📡 입금 확인 → 새로고침 없이 참가 확정 + 오픈채팅 안내", () => {
  it("관리자가 입금 확인을 누르면 참가자 화면 데이터가 실시간으로 바뀐다", async () => {
    // 관리자가 오픈채팅 정보를 저장해 둔다
    as(ADMIN);
    const chat = { chatUrl: "https://open.kakao.com/o/test-room", chatPassword: "test-pw" };
    await adminSaveParticipantChat(chat);
    expect(await adminGetParticipantChat()).toEqual(chat);

    // 참가자가 로그인한 채로 내 신청서를 지켜본다 (아직 신청 전)
    as(RUNNER);
    let mine: Enrollment | null | undefined;
    let watchError: Error | undefined;
    const stop = watchMyEnrollment(
      RUNNER,
      (value) => {
        mine = value;
      },
      (error) => {
        watchError = error;
      },
    );
    await eventually(() => mine !== undefined || watchError !== undefined);
    expect(watchError).toBeUndefined();
    expect(mine).toBeNull();

    // 신청하면 "입금 대기"로 바로 바뀐다
    await createEnrollment(application);
    await eventually(() => mine?.status === "pending");

    // 입금 대기 중에는 오픈채팅 정보를 받을 수 없다
    let pendingError: Error | undefined;
    const stopPending = watchParticipantChat(
      () => undefined,
      (error) => {
        pendingError = error;
      },
    );
    await eventually(() => pendingError !== undefined);
    stopPending();

    // 관리자가 입금 확인 → 참가자는 새로고침 없이 "참가 확정"
    as(ADMIN);
    await adminSetStatus(enrollmentId(RUNNER), "paid");
    await eventually(() => mine?.status === "paid");
    expect(watchError).toBeUndefined();
    stop();

    // 참가 확정 후에는 오픈채팅 정보를 받을 수 있다
    as(RUNNER);
    let received: ParticipantChat | null | undefined;
    const stopChat = watchParticipantChat(
      (value) => {
        received = value;
      },
      () => undefined,
    );
    await eventually(() => received !== undefined);
    expect(received).toEqual(chat);
    stopChat();
  });
});
