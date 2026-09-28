"use client";

/**
 * /feed — 함께 달리기(공동 피드). 같은 기수 참가자들의 인증을 모아 보여줍니다.
 *
 * 이 챌린지의 핵심은 경쟁이 아니라 "같이 하는" 느낌입니다.
 * 그래서 순위표는 두지 않고, 오늘 몇 명이 함께 달렸는지만 보여줍니다.
 */
import Link from "next/link";
import { useEffect, useState } from "react";

import { SignInCard } from "@/components/app/SignInCard";
import { Card, courseLabel, Notice, PageTitle, primaryButton, Spinner } from "@/components/app/ui";
import { challengeInfo } from "@/data/challenge";
import { useAuth } from "@/lib/auth";
import { listFeed, todayKST, type Checkin } from "@/lib/data";

export default function FeedPage() {
  const { user, loading, isParticipant, isAdmin } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    return (
      <>
        <PageTitle title="함께 달리기" />
        <SignInCard message="참가자끼리 서로의 러닝을 볼 수 있는 공간이에요. 로그인해 주세요." />
      </>
    );
  }

  if (!isParticipant && !isAdmin) {
    return (
      <>
        <PageTitle title="함께 달리기" />
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-pretty text-sm leading-relaxed text-ink-muted">
            참가가 확정된 분들만 볼 수 있는 공간이에요.
            <br />
            입금이 확인되면 바로 열려요.
          </p>
          <Link href="/me" className={primaryButton}>
            내 신청 상태 보기
          </Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title="함께 달리기"
        description={`${challengeInfo.cohortText} 동료들의 인증이에요. 오늘은 누가 달렸는지 구경하고 응원해 주세요.`}
      />
      <FeedList />
    </>
  );
}

function FeedList() {
  const [items, setItems] = useState<Checkin[] | null>(null);
  const [error, setError] = useState("");
  const [today] = useState(() => todayKST());

  useEffect(() => {
    let active = true;

    listFeed()
      .then((list) => {
        if (active) setItems(list);
      })
      .catch(() => {
        if (active) setError("피드를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!items) return <Spinner />;

  const runnersToday = new Set(items.filter((item) => item.date === today).map((item) => item.uid)).size;

  return (
    <div className="flex flex-col gap-4">
      <Card className="text-center">
        <p className="text-sm text-ink-muted">오늘 함께 달린 동료</p>
        <p className="font-display mt-1 text-3xl font-bold text-brand-600 dark:text-brand-300">
          {runnersToday}명
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          {runnersToday > 0 ? "나도 이어서 달려볼까요? 🏃" : "오늘의 첫 번째 러너가 되어보세요!"}
        </p>
      </Card>

      {items.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-ink-muted">아직 올라온 인증이 없어요.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="p-5 sm:p-5">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="font-display flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm text-brand-700 ring-1 ring-line dark:bg-brand-900/40 dark:text-brand-200"
                  >
                    {item.displayName.charAt(0)}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{item.displayName}</span>
                      {item.course ? (
                        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-ink-muted">
                          {courseLabel[item.course] ?? item.course}
                        </span>
                      ) : null}
                      <span className="ml-auto text-[11px] text-ink-muted">{item.date}</span>
                    </div>
                    <p className="font-display text-base text-brand-600 dark:text-brand-300">
                      {item.distanceKm}km
                      {typeof item.minutes === "number" ? (
                        <span className="text-sm text-ink-muted"> · {item.minutes}분</span>
                      ) : null}
                    </p>
                    {item.memo ? (
                      <p className="text-pretty text-sm leading-relaxed text-ink">{item.memo}</p>
                    ) : null}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
