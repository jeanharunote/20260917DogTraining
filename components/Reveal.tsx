"use client";

/** Reveal — 스크롤해서 화면에 들어오면 부드럽게 나타나는 애니메이션 래퍼입니다. */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** 여러 요소를 순서대로 등장시키고 싶을 때 지연 시간(초)을 줍니다. */
  delay?: number;
  /** 아래에서 위로 올라오는 거리(px) */
  y?: number;
  className?: string;
  /** div 말고 다른 태그로 감싸고 싶을 때 (예: "li", "section") */
  as?: "div" | "li" | "section" | "article";
};

export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: RevealProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
