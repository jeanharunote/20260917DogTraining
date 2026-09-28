"use client";

/**
 * ParticipantChatCard — 참가 확정자에게만 보여주는 오픈채팅방 입장 안내입니다.
 *
 * ⚠️ 이 컴포넌트는 반드시 신청 상태가 "참가 확정(paid)"일 때만 그려야 합니다.
 *    (신청 페이지·마이페이지에서 상태를 확인한 뒤에만 넣습니다)
 *    링크와 비밀번호는 코드에 없고 Firestore 에서 받아오며,
 *    firestore.rules 가 참가 확정자가 아니면 아예 내려주지 않습니다.
 */
import { useEffect, useRef, useState } from "react";

import { Card, Notice, primaryButton, secondaryButton, Spinner } from "@/components/app/ui";
import { footer } from "@/data/challenge";
import { isOpenChatUrl, watchParticipantChat, type ParticipantChat } from "@/lib/data";

type ChatState =
  | { kind: "loading" }
  | { kind: "ready"; chat: ParticipantChat }
  | { kind: "missing" }
  | { kind: "error" };

export function ParticipantChatCard({ children }: { children?: React.ReactNode }) {
  const [state, setState] = useState<ChatState>({ kind: "loading" });

  // 관리자가 링크를 저장하거나 바꾸면 새로고침 없이 반영됩니다.
  useEffect(
    () =>
      watchParticipantChat(
        (chat) => setState(chat && isOpenChatUrl(chat.chatUrl) ? { kind: "ready", chat } : { kind: "missing" }),
        (error) => {
          console.error("[chat] 오픈채팅 정보를 불러오지 못했어요", error);
          setState({ kind: "error" });
        },
      ),
    [],
  );

  return (
    <Card className="flex flex-col items-center gap-4 py-10 text-center">
      <h2 className="font-display text-xl text-ink">참가 확정 🎉</h2>
      <p className="text-pretty text-sm leading-relaxed text-ink-muted">
        입금이 확인됐어요. 참가자 전용 오픈채팅방에 들어와서 함께 달릴 준비를 해요!
      </p>

      {state.kind === "loading" ? <Spinner label="오픈채팅 정보를 불러오는 중..." /> : null}

      {state.kind === "ready" ? <ChatEntry chat={state.chat} /> : null}

      {state.kind === "missing" || state.kind === "error" ? (
        <Notice>
          {state.kind === "missing"
            ? "오픈채팅방 안내를 준비하고 있어요. 곧 이곳에 입장 버튼이 나타나요."
            : "오픈채팅 정보를 불러오지 못했어요. 잠시 후 새로고침해 주세요."}{" "}
          급하시면{" "}
          <a
            href={footer.contact.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            운영자 1:1 오픈채팅
          </a>
          으로 문의해 주세요.
        </Notice>
      ) : null}

      {children}
    </Card>
  );
}

function ChatEntry({ chat }: { chat: ParticipantChat }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copyPassword = async () => {
    const ok = await copyText(chat.chatPassword);

    setCopied(ok);
    if (timer.current) clearTimeout(timer.current);
    if (ok) timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <a href={chat.chatUrl} target="_blank" rel="noopener noreferrer" className={primaryButton}>
        오픈채팅방 입장하기
      </a>

      {chat.chatPassword ? (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-4 py-3 text-left">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] text-ink-muted">입장 비밀번호</span>
            <span className="font-display truncate text-base text-ink" data-testid="chat-password">
              {chat.chatPassword}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void copyPassword()}
            className={`${secondaryButton} shrink-0 px-4 py-2 text-xs`}
            aria-label="입장 비밀번호 복사"
          >
            {copied ? "복사됨 ✓" : "복사"}
          </button>
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-ink-muted">
        링크와 비밀번호는 참가자 전용이에요. 다른 분께는 공유하지 말아 주세요.
      </p>
    </div>
  );
}

/** 클립보드에 복사합니다. (클립보드 API 가 막힌 브라우저에서는 예전 방식으로 한 번 더 시도) */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();

      return ok;
    } catch {
      return false;
    }
  }
}
