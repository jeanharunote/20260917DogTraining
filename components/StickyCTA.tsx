"use client";

/**
 * StickyCTA — 조금 스크롤하면 화면 하단에 떠오르는 고정 신청 버튼입니다.
 * 신청 폼 섹션에 도달하면 자동으로 숨겨져서 버튼이 겹치지 않습니다.
 */
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { challengeInfo, cta } from "@/data/challenge";

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const signupSection = document.getElementById(cta.anchorId);

    const update = () => {
      // 한 화면 이상 스크롤했을 때부터 보여줍니다.
      const scrolledEnough = window.scrollY > window.innerHeight * 0.6;

      // 신청 폼이 화면에 보이기 시작하면 숨깁니다.
      const signupVisible = signupSection
        ? signupSection.getBoundingClientRect().top < window.innerHeight
        : false;

      setIsVisible(scrolledEnough && !signupVisible);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 px-5 py-3 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <div className="hidden flex-col sm:flex">
              <span className="font-display text-sm text-ink">{challengeInfo.name}</span>
              <span className="text-xs text-ink-muted">
                {challengeInfo.capacityText} 한정 · {challengeInfo.deadlineText} 마감
              </span>
            </div>
            <Link
              href={`#${cta.anchorId}`}
              className="btn-gradient font-display w-full rounded-full px-6 py-3.5 text-center text-sm font-medium transition-all sm:w-auto"
            >
              {cta.sticky}
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
