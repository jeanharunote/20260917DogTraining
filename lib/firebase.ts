/**
 * firebase.ts — Firebase 연결 설정 (로그인 + 데이터베이스)
 *
 * 무료 요금제(Spark)에서 쓸 수 있는 기능만 사용합니다.
 *   ✅ Authentication (구글 로그인)
 *   ✅ Firestore (신청서 · 러닝 인증 · 피드)
 *   ❌ Storage — Spark 요금제에서는 쓸 수 없어 사용하지 않습니다. (인증샷 업로드 없음)
 *   ❌ Cloud Functions — Blaze 요금제가 필요해 사용하지 않습니다.
 *
 * ℹ️ 설정값(apiKey 포함)이 코드에 그대로 들어가 있는데 괜찮나요?
 *    네, 괜찮습니다. Firebase 웹 설정값은 원래 공개되는 값입니다.
 *    비밀번호가 아니라 "어느 프로젝트인지" 알려주는 주소표에 가깝고,
 *    실제 보안은 firestore.rules(보안 규칙)가 담당합니다.
 *    → 그래서 firestore.rules 를 Firebase 콘솔에 반드시 적용해야 합니다.
 *
 * 다른 Firebase 프로젝트로 바꾸려면 환경변수 NEXT_PUBLIC_FIREBASE_* 를 설정하세요.
 * (환경변수가 있으면 아래 기본값보다 우선합니다)
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyBoUIURgU7wlUCbZsMIJXzMNAeQ6UN_ct8",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "runninghabitchallenge.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "runninghabitchallenge",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "186436760749",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:186436760749:web:3984fc3b6bf6870496c224",
};

/** 설정이 모두 들어왔는지 확인합니다. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId && firebaseConfig.authDomain,
  );
}

/** Next.js 는 화면을 여러 번 그리므로, 이미 만든 연결이 있으면 그대로 재사용합니다. */
function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/** 테스트에서 에뮬레이터용 데이터베이스를 끼워 넣을 때만 씁니다. */
let testDb: Firestore | null = null;

export function __setTestDb(db: Firestore | null): void {
  testDb = db;
}

export function getDb(): Firestore {
  return testDb ?? getFirestore(getFirebaseApp());
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/** 컬렉션 이름 — Firebase 콘솔에서 이 이름으로 찾으면 됩니다. */
export const COLLECTIONS = {
  users: "users",
  enrollments: "enrollments",
  checkins: "checkins",
  admins: "admins",
} as const;
