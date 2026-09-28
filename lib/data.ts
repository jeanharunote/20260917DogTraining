/**
 * data.ts — Firestore 데이터를 읽고 쓰는 함수 모음입니다.
 *
 * 화면(컴포넌트)에서는 Firestore 를 직접 다루지 않고 이 함수들만 부릅니다.
 * 권한 검사는 firestore.rules 가 서버에서 최종적으로 막아주므로,
 * 여기서 실수가 있어도 남의 데이터를 읽거나 결제 상태를 바꿀 수는 없습니다.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { challengeInfo } from "@/data/challenge";
import { COLLECTIONS, getDb } from "@/lib/firebase";

export type CourseValue = "beginner" | "ten-k" | "half";
export type EnrollmentStatus = "pending" | "paid" | "refunded" | "cancelled";

export type Enrollment = {
  id: string;
  uid: string;
  cohortId: string;
  name: string;
  email: string;
  phone: string;
  course: CourseValue;
  motivation?: string;
  agree: boolean;
  status: EnrollmentStatus;
  appliedAt?: Date;
  paidAt?: Date;
  refundedAt?: Date;
  adminMemo?: string;
};

export type Checkin = {
  id: string;
  uid: string;
  cohortId: string;
  date: string;
  distanceKm: number;
  minutes?: number;
  memo?: string;
  displayName: string;
  course?: CourseValue;
  createdAt?: Date;
};

const COHORT = challengeInfo.cohortId;

/** 신청서 문서 ID 규칙: {기수}_{UID} (보안 규칙과 반드시 같아야 합니다) */
export const enrollmentId = (uid: string, cohortId: string = COHORT) => `${cohortId}_${uid}`;

/** 인증 문서 ID 규칙: {기수}_{UID}_{날짜} → 하루 한 번만 올라가게 됩니다 */
export const checkinId = (uid: string, date: string, cohortId: string = COHORT) =>
  `${cohortId}_${uid}_${date}`;

function toDate(value: unknown): Date | undefined {
  return value instanceof Timestamp ? value.toDate() : undefined;
}

function toEnrollment(id: string, data: Record<string, unknown>): Enrollment {
  return {
    ...(data as Omit<Enrollment, "id" | "appliedAt" | "paidAt" | "refundedAt">),
    id,
    appliedAt: toDate(data.appliedAt),
    paidAt: toDate(data.paidAt),
    refundedAt: toDate(data.refundedAt),
  };
}

function toCheckin(id: string, data: Record<string, unknown>): Checkin {
  return { ...(data as Omit<Checkin, "id" | "createdAt">), id, createdAt: toDate(data.createdAt) };
}

/* ===========================================================================
 * 회원 · 관리자
 * ======================================================================== */

/** 로그인할 때마다 프로필을 최신으로 저장합니다. */
export async function saveProfile(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}): Promise<void> {
  await setDoc(doc(getDb(), COLLECTIONS.users, user.uid), {
    displayName: (user.displayName ?? "러너").slice(0, 50),
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
    updatedAt: serverTimestamp(),
  });
}

/** 운영자 이메일인지 (구글이 인증한 이메일일 때만 인정합니다) */
export function isAdminEmail(email: string | null | undefined, emailVerified: boolean): boolean {
  if (!email || !emailVerified) return false;

  return (challengeInfo.adminEmails as readonly string[]).includes(email.toLowerCase());
}

/**
 * 내가 관리자인지 확인합니다.
 * 화면 메뉴를 보여줄지 정하는 용도이고, 실제 권한은 firestore.rules 가 서버에서 확인합니다.
 */
export async function checkIsAdmin(user: {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}): Promise<boolean> {
  if (isAdminEmail(user.email, user.emailVerified)) return true;

  try {
    const snapshot = await getDoc(doc(getDb(), COLLECTIONS.admins, user.uid));

    return snapshot.exists();
  } catch {
    return false;
  }
}

/* ===========================================================================
 * 참가 신청
 * ======================================================================== */

export async function getMyEnrollment(uid: string): Promise<Enrollment | null> {
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.enrollments, enrollmentId(uid)));

  return snapshot.exists() ? toEnrollment(snapshot.id, snapshot.data()) : null;
}

/**
 * 내 신청서를 실시간으로 지켜봅니다.
 * 관리자가 입금 확인을 누르면 새로고침하지 않아도 바로 "참가 확정"으로 바뀝니다.
 * 돌려받은 함수를 부르면 지켜보기를 멈춥니다.
 */
export function watchMyEnrollment(
  uid: string,
  onChange: (enrollment: Enrollment | null) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    doc(getDb(), COLLECTIONS.enrollments, enrollmentId(uid)),
    (snapshot) => onChange(snapshot.exists() ? toEnrollment(snapshot.id, snapshot.data()) : null),
    onError,
  );
}

export async function createEnrollment(input: {
  uid: string;
  name: string;
  email: string;
  phone: string;
  course: CourseValue;
  motivation?: string;
  agree: true;
}): Promise<void> {
  await setDoc(doc(getDb(), COLLECTIONS.enrollments, enrollmentId(input.uid)), {
    uid: input.uid,
    cohortId: COHORT,
    name: input.name,
    email: input.email,
    phone: input.phone,
    course: input.course,
    motivation: input.motivation ?? "",
    agree: true,
    // 신청은 항상 "입금 대기"로 시작합니다. (보안 규칙이 다른 값을 거부합니다)
    status: "pending",
    appliedAt: serverTimestamp(),
  });
}

/* ===========================================================================
 * 참가자 전용 오픈채팅
 *
 * 링크와 비밀번호는 코드에 적지 않고 Firestore 에만 저장합니다.
 * 코드에 적으면 누구나 볼 수 있는 자바스크립트 파일과 GitHub 저장소에 그대로 드러나기 때문입니다.
 * firestore.rules 가 "참가 확정(paid)된 사람과 관리자"만 이 문서를 읽을 수 있게 막습니다.
 * ======================================================================== */

export type ParticipantChat = { chatUrl: string; chatPassword: string };

/** 카카오톡 오픈채팅 주소인지 (보안 규칙과 같은 조건) */
export function isOpenChatUrl(url: string): boolean {
  return /^https:\/\/open\.kakao\.com\/.+/.test(url) && url.length <= 200;
}

/** 오픈채팅 정보를 실시간으로 지켜봅니다. 관리자가 아직 저장하지 않았으면 null 입니다. */
export function watchParticipantChat(
  onChange: (chat: ParticipantChat | null) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    doc(getDb(), COLLECTIONS.participantChats, COHORT),
    (snapshot) => {
      const data = snapshot.data();

      onChange(
        data && typeof data.chatUrl === "string"
          ? { chatUrl: data.chatUrl, chatPassword: typeof data.chatPassword === "string" ? data.chatPassword : "" }
          : null,
      );
    },
    onError,
  );
}

/* ===========================================================================
 * 러닝 인증
 * ======================================================================== */

export async function addCheckin(input: {
  uid: string;
  date: string;
  distanceKm: number;
  minutes?: number;
  memo?: string;
  displayName: string;
  course: CourseValue;
}): Promise<void> {
  const payload: Record<string, unknown> = {
    uid: input.uid,
    cohortId: COHORT,
    date: input.date,
    distanceKm: input.distanceKm,
    displayName: input.displayName.slice(0, 30),
    course: input.course,
    createdAt: serverTimestamp(),
  };

  if (typeof input.minutes === "number") payload.minutes = input.minutes;
  if (input.memo) payload.memo = input.memo;

  await setDoc(doc(getDb(), COLLECTIONS.checkins, checkinId(input.uid, input.date)), payload);
}

export async function deleteCheckin(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.checkins, id));
}

/** 내 인증 기록 (최신순) */
export async function listMyCheckins(uid: string): Promise<Checkin[]> {
  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.checkins),
      where("cohortId", "==", COHORT),
      where("uid", "==", uid),
    ),
  );

  return snapshot.docs
    .map((item) => toCheckin(item.id, item.data()))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 공동 피드 — 같은 기수 참가자들의 최근 인증
 *
 * 정렬을 데이터베이스에 맡기면(orderBy) Firestore 복합 색인을 따로 만들어야 합니다.
 * 한 기수의 인증은 많아야 수백 건이라, 전부 가져와서 화면에서 정렬하는 편이 설정이 단순합니다.
 * (참가자가 수백 명으로 늘어나면 색인을 만들고 orderBy + limit 으로 바꾸세요)
 */
export async function listFeed(max = 50): Promise<Checkin[]> {
  const snapshot = await getDocs(
    query(collection(getDb(), COLLECTIONS.checkins), where("cohortId", "==", COHORT)),
  );

  return snapshot.docs
    .map((item) => toCheckin(item.id, item.data()))
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
    .slice(0, max);
}

/* ===========================================================================
 * 관리자 전용 (보안 규칙이 관리자가 아니면 거부합니다)
 * ======================================================================== */

export async function adminListEnrollments(): Promise<Enrollment[]> {
  const snapshot = await getDocs(
    query(collection(getDb(), COLLECTIONS.enrollments), where("cohortId", "==", COHORT)),
  );

  return snapshot.docs
    .map((item) => toEnrollment(item.id, item.data()))
    .sort((a, b) => (b.appliedAt?.getTime() ?? 0) - (a.appliedAt?.getTime() ?? 0));
}

export async function adminListCheckins(): Promise<Checkin[]> {
  const snapshot = await getDocs(
    query(collection(getDb(), COLLECTIONS.checkins), where("cohortId", "==", COHORT)),
  );

  return snapshot.docs.map((item) => toCheckin(item.id, item.data()));
}

export async function adminSetStatus(id: string, status: EnrollmentStatus, memo?: string): Promise<void> {
  const patch: Record<string, unknown> = { status, updatedAt: serverTimestamp() };

  if (status === "paid") patch.paidAt = serverTimestamp();
  if (status === "refunded") patch.refundedAt = serverTimestamp();
  if (memo !== undefined) patch.adminMemo = memo.slice(0, 300);

  await updateDoc(doc(getDb(), COLLECTIONS.enrollments, id), patch);
}

export async function adminGetParticipantChat(): Promise<ParticipantChat | null> {
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.participantChats, COHORT));
  const data = snapshot.data();

  return data ? { chatUrl: String(data.chatUrl ?? ""), chatPassword: String(data.chatPassword ?? "") } : null;
}

export async function adminSaveParticipantChat(chat: ParticipantChat): Promise<void> {
  await setDoc(doc(getDb(), COLLECTIONS.participantChats, COHORT), {
    chatUrl: chat.chatUrl.trim(),
    chatPassword: chat.chatPassword.trim(),
    updatedAt: serverTimestamp(),
  });
}

/* ===========================================================================
 * 계산 도우미
 * ======================================================================== */

/** 오늘 날짜를 한국 시간 기준 YYYY-MM-DD 로 돌려줍니다. */
export function todayKST(now: Date = new Date()): string {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  return kst.toISOString().slice(0, 10);
}

/** 인증 가능한 기간인지 (챌린지 시작일 ~ 종료일) */
export function isWithinChallenge(date: string): boolean {
  return date >= challengeInfo.startDate && date <= challengeInfo.endDate;
}

/**
 * 날짜가 몇 주차인지 (0부터). 챌린지 기간 밖이면 null.
 * 시작일부터 7일씩 끊습니다. (1주차 = 0)
 */
export function weekIndexOf(date: string): number | null {
  const start = Date.parse(`${challengeInfo.startDate}T00:00:00Z`);
  const day = Date.parse(`${date}T00:00:00Z`);

  if (Number.isNaN(day)) return null;

  const index = Math.floor((day - start) / (7 * 24 * 60 * 60 * 1000));

  return index >= 0 && index < challengeInfo.totalWeeks ? index : null;
}

/**
 * 진행률 요약
 *
 * 규칙: 4주 동안 "매주" 4회 이상 인증해야 완주로 인정됩니다.
 * 그래서 한 주에 4회를 넘게 해도 그 주는 4회까지만 진행률에 반영합니다.
 * (다른 주에 몰아서 채워 100%가 되는데 완주는 아닌 혼란을 막기 위해서입니다)
 */
export function summarize(checkins: Checkin[]) {
  const perWeek = challengeInfo.checkinsPerWeek;
  const weekly = Array.from({ length: challengeInfo.totalWeeks }, () => 0);

  checkins.forEach((item) => {
    const index = weekIndexOf(item.date);
    if (index !== null) weekly[index] += 1;
  });

  const credited = weekly.reduce((sum, count) => sum + Math.min(count, perWeek), 0);
  const totalKm = checkins.reduce((sum, item) => sum + item.distanceKm, 0);
  const target = challengeInfo.targetCheckins;
  const allWeeksDone = weekly.every((count) => count >= perWeek);

  return {
    /** 전체 인증 횟수 */
    total: checkins.length,
    /** 진행률에 인정되는 횟수 (주마다 최대 4회) */
    count: credited,
    target,
    /** 주차별 인증 횟수 */
    weekly,
    perWeek,
    totalKm: Math.round(totalKm * 10) / 10,
    percent: Math.min(100, Math.round((credited / target) * 100)),
    /** 완주했는지 (4주 모두 주 4회 이상) */
    completed: allWeeksDone,
  };
}
