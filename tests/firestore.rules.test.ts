/**
 * Firestore 보안 규칙 검증 테스트
 *
 * 실제 Firebase 에뮬레이터를 띄워서, 공격 시나리오를 하나씩 시도해 봅니다.
 * 실행: npm run test:rules  (Java 가 필요합니다)
 */
import { readFileSync } from "node:fs";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const COHORT = "cohort-1";
const ALICE = "alice"; // 결제 완료 참가자
const BOB = "bob"; // 입금 대기 신청자
const MALLORY = "mallory"; // 악의적인 사용자
const ADMIN = "admin-uid";

let env: RulesTestEnvironment;

const validEnrollment = (uid: string, overrides: Record<string, unknown> = {}) => ({
  uid,
  cohortId: COHORT,
  name: "홍길동",
  email: `${uid}@example.com`,
  phone: "010-1234-5678",
  course: "beginner",
  motivation: "대회 나가보고 싶어요",
  agree: true,
  status: "pending",
  ...overrides,
});

const validCheckin = (uid: string, date: string, overrides: Record<string, unknown> = {}) => ({
  uid,
  cohortId: COHORT,
  date,
  distanceKm: 3.2,
  minutes: 25,
  memo: "오늘도 완료!",
  displayName: "앨리스",
  course: "beginner",
  ...overrides,
});

const db = (uid?: string) =>
  uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-running-habit",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();

  // 테스트용 기본 데이터: 관리자 1명, 결제 완료 앨리스, 입금 대기 밥
  await env.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore();
    await setDoc(doc(admin, "admins", ADMIN), { note: "운영자" });
    await setDoc(doc(admin, "enrollments", `${COHORT}_${ALICE}`), validEnrollment(ALICE, { status: "paid" }));
    await setDoc(doc(admin, "enrollments", `${COHORT}_${BOB}`), validEnrollment(BOB));
    await setDoc(doc(admin, "checkins", `${COHORT}_${ALICE}_2026-10-05`), validCheckin(ALICE, "2026-10-05"));
  });
});

/* ========================================================================= */
describe("🔐 결제 상태 보호 — 가장 중요", () => {
  it("❌ 신청할 때 스스로 '결제 완료(paid)' 상태로 만들 수 없다", async () => {
    await assertFails(
      setDoc(doc(db(MALLORY), "enrollments", `${COHORT}_${MALLORY}`), validEnrollment(MALLORY, { status: "paid" })),
    );
  });

  it("❌ 이미 낸 신청서를 스스로 '결제 완료'로 바꿀 수 없다", async () => {
    await assertFails(updateDoc(doc(db(BOB), "enrollments", `${COHORT}_${BOB}`), { status: "paid" }));
  });

  it("✅ 관리자는 입금 확인 후 '결제 완료'로 바꿀 수 있다", async () => {
    await assertSucceeds(updateDoc(doc(db(ADMIN), "enrollments", `${COHORT}_${BOB}`), { status: "paid" }));
  });

  it("✅ 관리자는 환불 처리할 수 있다", async () => {
    await assertSucceeds(
      updateDoc(doc(db(ADMIN), "enrollments", `${COHORT}_${ALICE}`), { status: "refunded" }),
    );
  });

  it("❌ 관리자라도 신청자의 이름·연락처는 몰래 바꿀 수 없다", async () => {
    await assertFails(
      updateDoc(doc(db(ADMIN), "enrollments", `${COHORT}_${BOB}`), { phone: "010-0000-0000" }),
    );
  });

  it("❌ 관리자도 정해지지 않은 상태값은 넣을 수 없다", async () => {
    await assertFails(updateDoc(doc(db(ADMIN), "enrollments", `${COHORT}_${BOB}`), { status: "vip" }));
  });
});

/* ========================================================================= */
describe("🔐 관리자 사칭 방지", () => {
  it("❌ 스스로 관리자 목록에 자기를 추가할 수 없다", async () => {
    await assertFails(setDoc(doc(db(MALLORY), "admins", MALLORY), { note: "나도 관리자" }));
  });

  it("❌ 관리자도 웹에서는 다른 관리자를 추가할 수 없다 (콘솔 전용)", async () => {
    await assertFails(setDoc(doc(db(ADMIN), "admins", MALLORY), { note: "추가" }));
  });

  it("✅ 내가 관리자인지는 확인할 수 있다", async () => {
    await assertSucceeds(getDoc(doc(db(ADMIN), "admins", ADMIN)));
  });

  it("❌ 다른 사람이 관리자인지 엿볼 수 없다", async () => {
    await assertFails(getDoc(doc(db(MALLORY), "admins", ADMIN)));
  });
});

/* ========================================================================= */
describe("🔐 개인정보 보호 (신청서)", () => {
  it("✅ 내 신청서는 볼 수 있다", async () => {
    await assertSucceeds(getDoc(doc(db(BOB), "enrollments", `${COHORT}_${BOB}`)));
  });

  it("❌ 다른 사람의 신청서(이름·연락처)는 볼 수 없다", async () => {
    await assertFails(getDoc(doc(db(MALLORY), "enrollments", `${COHORT}_${ALICE}`)));
  });

  it("❌ 신청서 전체 목록을 가져갈 수 없다", async () => {
    await assertFails(getDocs(collection(db(MALLORY), "enrollments")));
  });

  it("❌ 로그인하지 않으면 아무 신청서도 볼 수 없다", async () => {
    await assertFails(getDoc(doc(db(), "enrollments", `${COHORT}_${ALICE}`)));
  });

  it("✅ 관리자는 전체 신청자 명단을 볼 수 있다", async () => {
    await assertSucceeds(getDocs(query(collection(db(ADMIN), "enrollments"), where("cohortId", "==", COHORT))));
  });
});

/* ========================================================================= */
describe("🔐 신청서 작성 규칙", () => {
  it("✅ 로그인한 사람은 자기 신청서를 '입금 대기'로 낼 수 있다", async () => {
    await assertSucceeds(setDoc(doc(db(MALLORY), "enrollments", `${COHORT}_${MALLORY}`), validEnrollment(MALLORY)));
  });

  it("❌ 다른 사람 이름으로 신청할 수 없다", async () => {
    await assertFails(setDoc(doc(db(MALLORY), "enrollments", `${COHORT}_${BOB}`), validEnrollment(BOB)));
  });

  it("❌ 로그인하지 않으면 신청할 수 없다", async () => {
    await assertFails(setDoc(doc(db(), "enrollments", `${COHORT}_anon`), validEnrollment("anon")));
  });

  it("❌ 개인정보 동의 없이는 신청할 수 없다", async () => {
    await assertFails(
      setDoc(doc(db(MALLORY), "enrollments", `${COHORT}_${MALLORY}`), validEnrollment(MALLORY, { agree: false })),
    );
  });

  it("❌ 없는 코스로는 신청할 수 없다", async () => {
    await assertFails(
      setDoc(doc(db(MALLORY), "enrollments", `${COHORT}_${MALLORY}`), validEnrollment(MALLORY, { course: "marathon" })),
    );
  });

  it("❌ 정해지지 않은 항목을 끼워 넣을 수 없다", async () => {
    await assertFails(
      setDoc(doc(db(MALLORY), "enrollments", `${COHORT}_${MALLORY}`), validEnrollment(MALLORY, { isAdmin: true })),
    );
  });
});

/* ========================================================================= */
describe("🏃 러닝 인증", () => {
  it("✅ 결제 완료 참가자는 인증을 올릴 수 있다", async () => {
    await assertSucceeds(
      setDoc(doc(db(ALICE), "checkins", `${COHORT}_${ALICE}_2026-10-06`), validCheckin(ALICE, "2026-10-06")),
    );
  });

  it("❌ 입금 대기 중인 신청자는 인증을 올릴 수 없다", async () => {
    await assertFails(
      setDoc(doc(db(BOB), "checkins", `${COHORT}_${BOB}_2026-10-06`), validCheckin(BOB, "2026-10-06")),
    );
  });

  it("❌ 신청하지 않은 사람은 인증을 올릴 수 없다", async () => {
    await assertFails(
      setDoc(doc(db(MALLORY), "checkins", `${COHORT}_${MALLORY}_2026-10-06`), validCheckin(MALLORY, "2026-10-06")),
    );
  });

  it("❌ 다른 사람 이름으로 인증을 올릴 수 없다", async () => {
    await assertFails(
      setDoc(doc(db(ALICE), "checkins", `${COHORT}_${BOB}_2026-10-06`), validCheckin(BOB, "2026-10-06")),
    );
  });

  it("❌ 하루 한 번 규칙을 우회하려고 문서 ID를 조작할 수 없다", async () => {
    await assertFails(
      setDoc(doc(db(ALICE), "checkins", `${COHORT}_${ALICE}_2026-10-06-두번째`), validCheckin(ALICE, "2026-10-06")),
    );
  });

  it.each([
    ["0km", { distanceKm: 0 }],
    ["음수 거리", { distanceKm: -3 }],
    ["100km 초과", { distanceKm: 150 }],
    ["거리가 글자", { distanceKm: "5km" }],
    ["날짜 형식 오류", { date: "10월 6일" }],
    ["메모 300자 초과", { memo: "가".repeat(301) }],
  ])("❌ 잘못된 값(%s)은 거부한다", async (_label, overrides) => {
    const date = (overrides as { date?: string }).date ?? "2026-10-07";
    await assertFails(
      setDoc(doc(db(ALICE), "checkins", `${COHORT}_${ALICE}_${date}`), validCheckin(ALICE, date, overrides)),
    );
  });

  it("❌ 올린 인증은 수정할 수 없다 (거리 부풀리기 방지)", async () => {
    await assertFails(updateDoc(doc(db(ALICE), "checkins", `${COHORT}_${ALICE}_2026-10-05`), { distanceKm: 42 }));
  });

  it("✅ 내 인증은 지울 수 있다", async () => {
    await assertSucceeds(deleteDoc(doc(db(ALICE), "checkins", `${COHORT}_${ALICE}_2026-10-05`)));
  });

  it("❌ 다른 사람의 인증은 지울 수 없다", async () => {
    await assertFails(deleteDoc(doc(db(MALLORY), "checkins", `${COHORT}_${ALICE}_2026-10-05`)));
  });
});

/* ========================================================================= */
describe("👥 공동 피드", () => {
  const feedQuery = (uid?: string) => query(collection(db(uid), "checkins"), where("cohortId", "==", COHORT));

  it("✅ 결제 완료 참가자는 같은 기수의 피드를 볼 수 있다", async () => {
    await assertSucceeds(getDocs(feedQuery(ALICE)));
  });

  it("❌ 입금 대기 중인 신청자는 피드를 볼 수 없다", async () => {
    await assertFails(getDocs(feedQuery(BOB)));
  });

  it("❌ 로그인하지 않으면 피드를 볼 수 없다", async () => {
    await assertFails(getDocs(feedQuery()));
  });

  it("✅ 관리자는 인증 현황을 볼 수 있다", async () => {
    await assertSucceeds(getDocs(feedQuery(ADMIN)));
  });
});

/* ========================================================================= */
describe("👤 회원 프로필", () => {
  it("✅ 내 프로필은 저장할 수 있다", async () => {
    await assertSucceeds(setDoc(doc(db(MALLORY), "users", MALLORY), { displayName: "말로리", email: "m@x.com" }));
  });

  it("❌ 다른 사람 프로필은 볼 수 없다", async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), "users", ALICE), { displayName: "앨리스" });
    });
    await assertFails(getDoc(doc(db(MALLORY), "users", ALICE)));
  });
});

/* ========================================================================= */
describe("🚫 그 밖의 경로", () => {
  it("❌ 규칙에 없는 컬렉션은 전부 막힌다", async () => {
    await assertFails(setDoc(doc(db(ADMIN), "secrets", "x"), { a: 1 }));
  });
});
