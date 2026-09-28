"use client";

/** /me — 마이페이지. 신청 상태, 진행률, 러닝 인증, 내 인증 기록을 보여줍니다. */
import Link from "next/link";
import { useEffect, useState } from "react";

import { CheckinForm } from "@/components/app/CheckinForm";
import { SignInCard } from "@/components/app/SignInCard";
import {
  Card,
  courseLabel,
  Notice,
  PageTitle,
  primaryButton,
  secondaryButton,
  Spinner,
  StatusBadge,
} from "@/components/app/ui";
import { challengeInfo } from "@/data/challenge";
import { useAuth } from "@/lib/auth";
import { deleteCheckin, listMyCheckins, summarize, todayKST, type Checkin } from "@/lib/data";

export default function MyPage() {
  const { user, loading, enrollment, isParticipant, isAdmin } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    return (
      <>
        <PageTitle title="마이페이지" />
        <SignInCard message="로그인하면 신청 상태와 러닝 인증 기록을 확인할 수 있어요." />
      </>
    );
  }

  return (
    <>
      <PageTitle
        title={`${user.displayName ?? "러너"}님, 반가워요`}
        description={`${challengeInfo.name} ${challengeInfo.cohortText} · ${challengeInfo.periodText}`}
      />

      {isAdmin ? (
        <div className="mb-4">
          <Notice>
            관리자 계정이에요.{" "}
            <Link href="/admin" className="font-semibold underline underline-offset-2">
              관리자 페이지로 가기
            </Link>
          </Notice>
        </div>
      ) : null}

      {!enrollment ? (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-ink-muted">아직 이번 기수에 신청하지 않았어요.</p>
          <Link href="/apply" className={primaryButton}>
            {challengeInfo.cohortText} 신청하기
          </Link>
        </Card>
      ) : !isParticipant ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink">신청 상태</span>
            <StatusBadge status={enrollment.status} />
          </div>
          {enrollment.status === "pending" ? (
            <>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                입금이 확인되면 참가가 확정되고, 이곳에서 러닝 인증을 시작할 수 있어요.
              </p>
              <Link href="/apply" className={`${secondaryButton} mt-5`}>
                입금 안내 다시 보기
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">문의 사항은 운영자에게 연락해 주세요.</p>
          )}
        </Card>
      ) : (
        <ParticipantDashboard
          uid={user.uid}
          displayName={enrollment.name}
          course={enrollment.course}
        />
      )}
    </>
  );
}

/** 참가 확정자 전용: 진행률 + 인증하기 + 내 기록 */
function ParticipantDashboard({
  uid,
  displayName,
  course,
}: {
  uid: string;
  displayName: string;
  course: Checkin["course"] & string;
}) {
  const [checkins, setCheckins] = useState<Checkin[] | null>(null);
  const [error, setError] = useState("");
  // 인증을 올리거나 지우면 숫자를 올려서 목록을 다시 불러옵니다.
  const [version, setVersion] = useState(0);
  const [today] = useState(() => todayKST());

  useEffect(() => {
    let active = true;

    listMyCheckins(uid)
      .then((list) => {
        if (active) setCheckins(list);
      })
      .catch(() => {
        if (active) setError("인증 기록을 불러오지 못했어요.");
      });

    return () => {
      active = false;
    };
  }, [uid, version]);

  const reload = async () => setVersion((value) => value + 1);

  const handleDelete = async (checkin: Checkin) => {
    if (!window.confirm(`${checkin.date} 인증을 삭제할까요?`)) return;

    try {
      await deleteCheckin(checkin.id);
      await reload();
    } catch {
      setError("삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  if (!checkins) return error ? <Notice tone="error">{error}</Notice> : <Spinner />;

  const stats = summarize(checkins);
  const beforeStart = today < challengeInfo.startDate;
  const afterEnd = today > challengeInfo.endDate;

  return (
    <div className="flex flex-col gap-4">
      {/* 진행률 */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-ink">
            {courseLabel[course] ?? course} 코스 진행률
          </span>
          <StatusBadge status="paid" />
        </div>

        <p className="font-display mt-4 text-3xl font-bold text-ink">
          {stats.count}
          <span className="text-base font-medium text-ink-muted"> / {stats.target}회</span>
        </p>

        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-muted ring-1 ring-inset ring-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={stats.percent}
          aria-label="인증 진행률"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
            style={{ width: `${stats.percent}%` }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-surface-muted px-3 py-3">
            <dt className="text-[11px] text-ink-muted">누적 거리</dt>
            <dd className="font-display text-lg text-ink">{stats.totalKm}km</dd>
          </div>
          <div className="rounded-xl bg-surface-muted px-3 py-3">
            <dt className="text-[11px] text-ink-muted">달성률</dt>
            <dd className="font-display text-lg text-ink">{stats.percent}%</dd>
          </div>
        </dl>

        {stats.completed ? (
          <div className="mt-4">
            <Notice tone="success">🏅 목표 {stats.target}회 달성! 완주를 축하해요.</Notice>
          </div>
        ) : null}
      </Card>

      {/* 인증하기 */}
      {beforeStart ? (
        <Notice>
          챌린지는 {challengeInfo.startDate}에 시작해요. 그날부터 인증을 올릴 수 있어요. 조금만 기다려 주세요!
        </Notice>
      ) : afterEnd ? (
        <Notice>챌린지 기간이 끝났어요. 함께 달려주셔서 고마워요!</Notice>
      ) : (
        <CheckinForm
          uid={uid}
          displayName={displayName}
          course={course}
          today={today}
          doneDates={checkins.map((item) => item.date)}
          onSaved={reload}
        />
      )}

      {error ? <Notice tone="error">{error}</Notice> : null}

      {/* 내 기록 */}
      <Card title="내 인증 기록">
        {checkins.length === 0 ? (
          <p className="text-sm text-ink-muted">아직 인증 기록이 없어요. 첫 기록을 남겨보세요!</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {checkins.map((checkin) => (
              <li
                key={checkin.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-ink">
                    {checkin.date} · {checkin.distanceKm}km
                    {typeof checkin.minutes === "number" ? ` · ${checkin.minutes}분` : ""}
                  </span>
                  {checkin.memo ? <span className="text-xs text-ink-muted">{checkin.memo}</span> : null}
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(checkin)}
                  className="shrink-0 text-xs text-ink-muted underline-offset-2 hover:text-accent-600 hover:underline"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
