/**
 * IconBadge — 카드 위에 붙는 보라색 아이콘. 사이트 전체의 아이콘 모양을 한 곳에서 맞춥니다.
 * data/challenge.ts 에서는 icon: "sprout" 처럼 아래 목록의 이름만 적으면 됩니다.
 * 새 아이콘이 필요하면 https://lucide.dev/icons 에서 골라 아래 icons 에 한 줄 추가하세요.
 */
import {
  CalendarX,
  Camera,
  ChartColumn,
  ClipboardList,
  Dumbbell,
  Flag,
  Flame,
  Frown,
  Handshake,
  Medal,
  Salad,
  Sprout,
  Target,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const icons = {
  sprout: Sprout,
  flame: Flame,
  medal: Medal,
  "calendar-x": CalendarX,
  frown: Frown,
  "trending-down": TrendingDown,
  handshake: Handshake,
  target: Target,
  clipboard: ClipboardList,
  camera: Camera,
  salad: Salad,
  dumbbell: Dumbbell,
  flag: Flag,
  chart: ChartColumn,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export function IconBadge({ name, className }: { name: IconName; className?: string }) {
  const Icon = icons[name];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-800",
        className,
      )}
    >
      <Icon className="size-[22px]" strokeWidth={1.8} />
    </span>
  );
}
