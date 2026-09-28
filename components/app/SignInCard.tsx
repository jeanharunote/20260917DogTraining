"use client";

/** SignInCard — 로그인이 필요한 페이지에서 보여주는 구글 로그인 카드입니다. */
import { useState } from "react";

import { Card, Notice, primaryButton } from "@/components/app/ui";
import { describeAuthError, useAuth } from "@/lib/auth";

export function SignInCard({ message }: { message: string }) {
  const { signInWithGoogle } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setPending(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (caught) {
      setError(describeAuthError(caught));
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="flex flex-col items-center gap-5 py-12 text-center">
      <p className="text-pretty text-sm leading-relaxed text-ink-muted">{message}</p>

      <button type="button" onClick={() => void handleClick()} disabled={pending} className={primaryButton}>
        {/* 구글 로고 */}
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
          <path fill="#fff" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.68 4.1-5.35 4.1a5.95 5.95 0 0 1 0-11.9c1.85 0 3.1.79 3.8 1.47l2.6-2.5A9.3 9.3 0 0 0 12 2.7a9.3 9.3 0 1 0 0 18.6c5.37 0 8.93-3.77 8.93-9.09 0-.61-.07-1.08-.16-1.54z" />
        </svg>
        {pending ? "로그인 창을 여는 중..." : "구글로 로그인"}
      </button>

      {error ? <Notice tone="error">{error}</Notice> : null}

      <p className="text-[11px] text-ink-muted">
        로그인하면 이름·이메일·프로필 사진이 챌린지 운영에 사용됩니다.
      </p>
    </Card>
  );
}
