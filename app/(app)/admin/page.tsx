"use client";

/**
 * /admin — 관리자 페이지. 결제자 명단, 입금 확인·환불 처리, 인증 현황을 관리합니다.
 *
 * 누가 관리자인가요?
 *   - 운영자 구글 계정(data/challenge.ts 의 adminEmails)으로 로그인하면 바로 관리자입니다.
 *   - 관리자를 더 두려면: 그 사람이 이 페이지에 로그인해 나오는 UID 를 복사한 뒤
 *     Firebase 콘솔 → Firestore → admins 컬렉션에 그 UID 로 문서를 만들면 됩니다.
 *
 * 보안: 관리자 여부는 firestore.rules 가 서버에서 확인하므로,
 *       화면을 조작해도 관리자가 아니면 명단을 볼 수 없습니다.
 */
import { useEffect, useMemo, useState } from "react";

import { SignInCard } from "@/components/app/SignInCard";
import {
  Card,
  courseLabel,
  Notice,
  PageTitle,
  secondaryButton,
  Spinner,
  StatusBadge,
} from "@/components/app/ui";
import { challengeInfo } from "@/data/challenge";
import { useAuth } from "@/lib/auth";
import {
  adminListCheckins,
  adminListEnrollments,
  adminSetStatus,
  summarize,
  type Checkin,
  type Enrollment,
  type EnrollmentStatus,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    return (
      <>
        <PageTitle title="관리자" />
        <SignInCard message="운영자 계정으로 로그인해 주세요." />
      </>
    );
  }

  if (!isAdmin) return <NotAdmin uid={user.uid} />;

  return (
    <>
      <PageTitle
        title="관리자"
        description={`${challengeInfo.name} ${challengeInfo.cohortText} · 신청자 명단과 인증 현황`}
      />
      <AdminDashboard />
    </>
  );
}

/** 관리자가 아닐 때: 내 UID 와 등록 방법을 안내합니다. */
function NotAdmin({ uid }: { uid: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(uid);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <PageTitle title="관리자 권한이 없어요" />
      <Card>
        <p className="text-sm leading-relaxed text-ink-muted">
          운영자라면 운영자 구글 계정으로 다시 로그인해 주세요. 로그아웃한 뒤 계정을 골라 로그인하면 됩니다.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          다른 사람을 관리자로 추가하려면 아래 UID 를 Firebase 콘솔에 등록하세요.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-3">
          <code className="min-w-0 flex-1 truncate text-xs text-ink">{uid}</code>
          <button type="button" onClick={() => void copy()} className="shrink-0 text-xs font-semibold text-brand-600">
            {copied ? "복사됨 ✓" : "복사"}
          </button>
        </div>

        <ol className="mt-5 flex list-decimal flex-col gap-1.5 pl-5 text-xs leading-relaxed text-ink-muted">
          <li>Firebase 콘솔 → Firestore Database → [컬렉션 시작]</li>
          <li>
            컬렉션 ID 에 <code className="text-ink">admins</code> 입력
          </li>
          <li>문서 ID 에 위 UID 를 붙여넣기</li>
          <li>
            필드 하나 추가 (예: <code className="text-ink">note</code> = <code className="text-ink">운영자</code>) 후 저장
          </li>
          <li>이 페이지 새로고침</li>
        </ol>
      </Card>
    </>
  );
}

type Filter = "all" | EnrollmentStatus;

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "pending", label: "입금 대기" },
  { value: "paid", label: "참가 확정" },
  { value: "refunded", label: "환불" },
];

function AdminDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([adminListEnrollments(), adminListCheckins()])
      .then(([list, logs]) => {
        if (!active) return;
        setEnrollments(list);
        setCheckins(logs);
      })
      .catch((caught) => {
        console.error("[admin] 불러오기 실패", caught);
        if (active) setError("명단을 불러오지 못했어요. 보안 규칙(firestore.rules)이 적용됐는지 확인해 주세요.");
      });

    return () => {
      active = false;
    };
  }, [version]);

  // 참가자별 인증 요약
  const statsByUid = useMemo(() => {
    const grouped = new Map<string, Checkin[]>();

    checkins.forEach((item) => grouped.set(item.uid, [...(grouped.get(item.uid) ?? []), item]));

    return new Map(
      [...grouped.entries()].map(([uid, list]) => [
        uid,
        { ...summarize(list), lastDate: list.map((item) => item.date).sort().at(-1) },
      ]),
    );
  }, [checkins]);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!enrollments) return <Spinner />;

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter((item) => item.status === "pending").length,
    paid: enrollments.filter((item) => item.status === "paid").length,
    refunded: enrollments.filter((item) => item.status === "refunded").length,
    cancelled: enrollments.filter((item) => item.status === "cancelled").length,
  };

  const visible = filter === "all" ? enrollments : enrollments.filter((item) => item.status === filter);

  const changeStatus = async (item: Enrollment, status: EnrollmentStatus, confirmText: string) => {
    if (!window.confirm(confirmText)) return;

    setBusyId(item.id);

    try {
      await adminSetStatus(item.id, status);
      setVersion((value) => value + 1);
    } catch (caught) {
      console.error("[admin] 상태 변경 실패", caught);
      setError("상태를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 요약 */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "전체 신청", value: counts.all },
          { label: "입금 대기", value: counts.pending },
          { label: "참가 확정", value: counts.paid },
          { label: "정원", value: challengeInfo.capacityText },
        ].map((stat) => (
          <div key={stat.label} className="card-soft rounded-2xl border border-line bg-surface px-4 py-4 text-center">
            <dt className="text-[11px] text-ink-muted">{stat.label}</dt>
            <dd className="font-display mt-1 text-2xl font-bold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {/* 필터 + 내려받기 */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            aria-pressed={filter === item.value}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === item.value
                ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                : "border-line bg-surface text-ink-muted hover:text-ink",
            )}
          >
            {item.label} {counts[item.value]}
          </button>
        ))}

        <button
          type="button"
          onClick={() => downloadCsv(enrollments, statsByUid)}
          className={cn(secondaryButton, "ml-auto px-4 py-1.5 text-xs")}
        >
          명단 내려받기 (CSV)
        </button>
      </div>

      {/* 명단 */}
      {visible.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-ink-muted">해당하는 신청자가 없어요.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((item) => {
            const stats = statsByUid.get(item.uid);
            const busy = busyId === item.id;

            return (
              <li key={item.id}>
                <Card className="p-5 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{item.name}</span>
                    <StatusBadge status={item.status} />
                    <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-ink-muted">
                      {courseLabel[item.course] ?? item.course}
                    </span>
                    <span className="ml-auto text-[11px] text-ink-muted">
                      {item.appliedAt ? formatDateTime(item.appliedAt) : "-"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-ink-muted">
                    {item.email} · {item.phone}
                  </p>
                  {item.motivation ? (
                    <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs leading-relaxed text-ink">
                      {item.motivation}
                    </p>
                  ) : null}

                  {item.status === "paid" ? (
                    <p className="mt-3 text-xs text-ink-muted">
                      인증 {stats?.count ?? 0}/{challengeInfo.targetCheckins}회 · {stats?.totalKm ?? 0}km
                      {stats?.lastDate ? ` · 마지막 인증 ${stats.lastDate}` : " · 아직 인증 없음"}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.status === "pending" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void changeStatus(item, "paid", `${item.name}님의 입금을 확인하고 참가를 확정할까요?`)
                        }
                        className="btn-gradient rounded-full px-4 py-2 text-xs font-medium disabled:opacity-60"
                      >
                        입금 확인 → 참가 확정
                      </button>
                    ) : null}

                    {item.status === "paid" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void changeStatus(
                            item,
                            "refunded",
                            `${item.name}님을 환불 처리할까요?\n(실제 송금은 따로 해주셔야 합니다)`,
                          )
                        }
                        className={cn(secondaryButton, "px-4 py-2 text-xs")}
                      >
                        환불 처리
                      </button>
                    ) : null}

                    {item.status !== "pending" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void changeStatus(item, "pending", `${item.name}님을 '입금 대기'로 되돌릴까요?`)
                        }
                        className="rounded-full px-3 py-2 text-xs text-ink-muted underline-offset-2 hover:underline"
                      >
                        입금 대기로 되돌리기
                      </button>
                    ) : null}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 엑셀에서 한글이 깨지지 않도록 BOM 을 붙여 CSV 로 내려받습니다. */
function downloadCsv(
  list: Enrollment[],
  statsByUid: Map<string, { count: number; totalKm: number; lastDate?: string }>,
) {
  const header = ["이름", "이메일", "연락처", "코스", "상태", "신청일시", "인증 횟수", "누적 거리(km)", "참가 동기"];
  const statusText: Record<EnrollmentStatus, string> = {
    pending: "입금 대기",
    paid: "참가 확정",
    refunded: "환불",
    cancelled: "취소",
  };

  const rows = list.map((item) => {
    const stats = statsByUid.get(item.uid);

    return [
      item.name,
      item.email,
      item.phone,
      courseLabel[item.course] ?? item.course,
      statusText[item.status],
      item.appliedAt ? item.appliedAt.toLocaleString("ko-KR") : "",
      String(stats?.count ?? 0),
      String(stats?.totalKm ?? 0),
      item.motivation ?? "",
    ];
  });

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${challengeInfo.cohortId}-신청자명단.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
