"use client";

/** /apply — 참가 신청 페이지. 로그인 → 신청서 작성 → 입금 안내 순서로 진행됩니다. */
import Link from "next/link";
import { useState } from "react";

import { ApplyForm } from "@/components/app/ApplyForm";
import { SignInCard } from "@/components/app/SignInCard";
import { Card, Notice, PageTitle, primaryButton, Spinner, StatusBadge } from "@/components/app/ui";
import { challengeInfo, payment } from "@/data/challenge";
import { useAuth } from "@/lib/auth";

export default function ApplyPage() {
  const { user, loading, enrollment, refreshEnrollment } = useAuth();
  // 모집 마감 여부는 화면을 처음 열 때 한 번만 계산합니다.
  const [isClosed] = useState(() => Date.now() > new Date(challengeInfo.deadline).getTime());

  return (
    <>
      <PageTitle
        title={`${challengeInfo.name} ${challengeInfo.cohortText} 신청`}
        description={`${challengeInfo.periodText} · ${challengeInfo.capacityText} 한정 · 참가비 ${challengeInfo.feeText} (${challengeInfo.feeBreakdown}) · ${challengeInfo.feeNote}`}
      />

      {loading ? (
        <Spinner />
      ) : !user ? (
        <SignInCard message="신청하려면 먼저 구글 계정으로 로그인해 주세요. 신청 내역과 러닝 인증이 이 계정에 저장돼요." />
      ) : enrollment ? (
        <EnrollmentStatusCard />
      ) : isClosed ? (
        <Notice>{challengeInfo.cohortText} 모집이 마감되었어요. 다음 기수 소식을 기다려 주세요!</Notice>
      ) : (
        <ApplyForm user={user} onApplied={refreshEnrollment} />
      )}
    </>
  );
}

/** 이미 신청한 경우: 상태에 따라 입금 안내 또는 참가 확정 안내를 보여줍니다. */
function EnrollmentStatusCard() {
  const { enrollment } = useAuth();

  if (!enrollment) return null;

  if (enrollment.status === "paid") {
    return (
      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <span aria-hidden="true" className="text-4xl">🎉</span>
        <h2 className="font-display text-xl text-ink">참가가 확정됐어요!</h2>
        <p className="text-sm text-ink-muted">마이페이지에서 러닝 인증을 시작해 보세요.</p>
        <Link href="/me" className={primaryButton}>
          마이페이지로 가기
        </Link>
      </Card>
    );
  }

  if (enrollment.status === "pending") {
    return (
      <div className="flex flex-col gap-4">
        <Notice tone="success">신청이 접수됐어요! 아래 계좌로 참가비를 입금해 주세요.</Notice>

        <Card title="참가비 입금 안내">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="은행" value={payment.bankName} />
            <Row label="계좌번호" value={payment.accountNumber} />
            <Row label="예금주" value={payment.accountHolder} />
            <Row label="입금액" value={`${challengeInfo.feeText} (${challengeInfo.feeBreakdown})`} />
            <Row label="입금자명" value={enrollment.name} />
            <Row label="입금 기한" value={payment.dueText} />
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-ink-muted">{payment.notice}</p>
          <p className="mt-2 text-xs leading-relaxed text-brand-600 dark:text-brand-300">
            💰 {challengeInfo.depositRule}. 보증금은 챌린지가 끝나고 {challengeInfo.depositReturnDays}일 안에
            입금하신 계좌로 돌려드리니, 돌려받으실 본인 계좌에서 입금해 주세요.
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink">현재 상태</span>
            <StatusBadge status={enrollment.status} />
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            입금 확인은 보통 하루 안에 처리돼요. 확인되면 이 화면이 &lsquo;참가 확정&rsquo;으로 바뀝니다.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-ink">신청 상태</span>
        <StatusBadge status={enrollment.status} />
      </div>
      <p className="mt-3 text-xs text-ink-muted">문의 사항은 운영자에게 연락해 주세요.</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-surface-muted px-4 py-3">
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd className="font-display text-sm text-ink">{value}</dd>
    </div>
  );
}
