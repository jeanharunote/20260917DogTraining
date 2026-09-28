"use client";

/**
 * auth.tsx — 로그인 상태를 앱 전체에서 함께 쓰기 위한 도구입니다.
 *
 * 로그인하면 다음을 한 번에 불러옵니다.
 *   - 로그인한 사용자 정보 (구글 계정)
 *   - 이번 기수 신청서 (입금 대기 / 참가 확정 등)
 *   - 관리자 여부
 */
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { checkIsAdmin, getMyEnrollment, saveProfile, type Enrollment } from "@/lib/data";
import { getFirebaseAuth } from "@/lib/firebase";

type AuthState = {
  user: User | null;
  /** 첫 로그인 상태를 확인하는 중인지 */
  loading: boolean;
  isAdmin: boolean;
  enrollment: Enrollment | null;
  /** 참가 확정(결제 완료)된 참가자인지 */
  isParticipant: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** 신청서를 다시 불러옵니다. (신청 직후 등) */
  refreshEnrollment: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/** 구글 로그인 창이 막히거나 닫혔을 때 사람이 읽을 수 있는 문구로 바꿉니다. */
export function describeAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";

  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "로그인 창이 닫혔어요. 다시 시도해 주세요.";
  }

  if (code === "auth/popup-blocked") {
    return "브라우저가 로그인 창을 막았어요. 팝업 차단을 해제하고 다시 시도해 주세요.";
  }

  if (code === "auth/unauthorized-domain") {
    return "이 주소에서는 로그인이 허용되지 않았어요. 운영자에게 알려주세요. (승인된 도메인 설정 필요)";
  }

  if (code === "auth/operation-not-allowed") {
    return "구글 로그인이 아직 켜져 있지 않아요. 운영자에게 알려주세요.";
  }

  return "로그인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  // 로그인 상태가 바뀔 때마다 (외부 시스템인 Firebase 를 구독) 관련 정보를 불러옵니다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        setEnrollment(null);
        setLoading(false);

        return;
      }

      try {
        const [, admin, mine] = await Promise.all([
          saveProfile(nextUser).catch(() => undefined),
          checkIsAdmin(nextUser.uid),
          getMyEnrollment(nextUser.uid).catch(() => null),
        ]);

        setIsAdmin(admin);
        setEnrollment(mine);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    // 매번 계정을 고를 수 있게 해서, 가족 계정 등으로 잘못 로그인하는 일을 줄입니다.
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(getFirebaseAuth(), provider);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const refreshEnrollment = useCallback(async () => {
    if (!user) return;
    setEnrollment(await getMyEnrollment(user.uid).catch(() => null));
  }, [user]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAdmin,
      enrollment,
      isParticipant: enrollment?.status === "paid",
      signInWithGoogle,
      signOut,
      refreshEnrollment,
    }),
    [user, loading, isAdmin, enrollment, signInWithGoogle, signOut, refreshEnrollment],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth 는 AuthProvider 안에서만 쓸 수 있습니다.");
  }

  return context;
}
