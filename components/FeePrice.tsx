/**
 * FeePrice — 참가비를 "정가 50,000원 → 1기 한정 30,000원" 으로 보여줍니다.
 *   정가에는 취소선, 1기 한정가는 굵게 강조합니다.
 *   금액은 data/challenge.ts 의 challengeInfo(feeText · regularFeeText · feeLabel)에서만 바꾸세요.
 *
 * ⚠️ 실제 입금액을 안내하는 곳(입금 안내의 "입금액")에는 쓰지 마세요.
 *    그곳은 challengeInfo.feeText 한 가지 금액만 보여줘야 합니다.
 */
import { Fragment } from "react";

import { challengeInfo, FEE_TOKEN } from "@/data/challenge";
import { cn } from "@/lib/utils";

export function FeePrice({
  tone = "light",
  className,
}: {
  /** light: 밝은 배경, dark: 어두운 배경(히어로) */
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span className={className}>
      <del
        className={cn(
          "whitespace-nowrap font-normal decoration-1",
          tone === "dark" ? "text-white/55" : "text-ink-muted",
        )}
      >
        정가 {challengeInfo.regularFeeText}
      </del>{" "}
      <span aria-hidden="true" className={tone === "dark" ? "text-white/55" : "text-ink-muted"}>
        →
      </span>{" "}
      <strong
        className={cn(
          "whitespace-nowrap font-bold",
          tone === "dark" ? "text-white" : "text-brand-600 dark:text-brand-300",
        )}
      >
        {challengeInfo.feeLabel} {challengeInfo.feeText}
      </strong>
    </span>
  );
}

/** 문장 속 {{참가비}} 표시를 FeePrice 로 바꿔서 보여줍니다. (FAQ 답변 등) */
export function WithFee({ text }: { text: string }) {
  const parts = text.split(FEE_TOKEN);

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? <FeePrice /> : null}
        </Fragment>
      ))}
    </>
  );
}
