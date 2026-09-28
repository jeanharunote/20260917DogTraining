"use client";

/**
 * auth.tsx — 로그인 상태를 앱 전체에서 함께 쓰기 위한 도구입니다.
 *
 * 로그인하면 다음을 한 번에 불러옵니다.
 *   - 로그인한 사용자 정보 (구글 계정)
 *   - 이번 기수 신청서 (입금 대기 / 참가 확정 등, 실시간)
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

import { checkIsAdmin, getMyEnrollment, saveProfile, watchMyEnrollment, type Enrollment } from "@/lib/data";
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
  // 신청서는 실시간으로 지켜봐서, 관리자가 입금 확인을 누르면 새로고침 없이 화면이 바뀝니다.
  useEffect(() => {
    let stopEnrollment: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      stopEnrollment?.();
      stopEnrollment = null;
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        setEnrollment(null);
        setLoading(false);

        return;
      }

      // 첫 신청서 정보가 도착할 때까지 "불러오는 중"을 유지합니다.
      let markLoaded: () => void = () => undefined;
      const firstSnapshot = new Promise<void>((resolve) => {
        markLoaded = resolve;
      });

      stopEnrollment = watchMyEnrollment(
        nextUser.uid,
        (mine) => {
          setEnrollment(mine);
          markLoaded();
        },
        (error) => {
          console.error("[auth] 신청서 실시간 연결 실패", error);
          markLoaded();
        },
      );

      try {
        const [, admin] = await Promise.all([
          saveProfile(nextUser).catch(() => undefined),
          checkIsAdmin(nextUser),
          firstSnapshot,
        ]);

        // 그 사이 다른 계정으로 바뀌었다면 이전 계정의 결과는 버립니다.
        if (getFirebaseAuth().currentUser?.uid === nextUser.uid) setIsAdmin(admin);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      stopEnrollment?.();
      unsubscribe();
    };
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

  // 실시간 연결이 있어 보통은 필요 없지만, 신청 직후 확실히 반영하려고 한 번 더 읽습니다.
  const refreshEnrollment = useCallback(async () => {
    if (!user) return;
    const mine = await getMyEnrollment(user.uid).catch(() => undefined);
    if (mine !== undefined) setEnrollment(mine);
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
