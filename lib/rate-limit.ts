/**
 * rate-limit.ts — 운영자의 API 키를 쓸 때 호출 횟수를 제한합니다.
 *
 * 공개된 페이지라서 제한이 없으면 누군가 반복 호출해 운영자의 사용량을
 * 소진시킬 수 있습니다. 같은 방문자(IP)가 짧은 시간에 여러 번 부르지 못하게 막습니다.
 *
 * 주의: 서버 메모리에만 기록하므로 서버가 여러 대로 늘어나면 완벽하지는 않습니다.
 *       정확한 제한이 필요하면 Upstash Redis 같은 외부 저장소를 붙이세요.
 */

/** TODO: 제한을 바꾸고 싶다면 이 두 값을 수정하세요. */
const WINDOW_MS = 10 * 60 * 1000; // 10분
const MAX_REQUESTS = 5; // 10분당 5회

const hits = new Map<string, number[]>();

/** 오래된 기록을 정리해 메모리가 계속 늘어나지 않게 합니다. */
function prune(now: number): void {
  for (const [key, times] of hits) {
    const fresh = times.filter((time) => now - time < WINDOW_MS);

    if (fresh.length === 0) {
      hits.delete(key);
    } else {
      hits.set(key, fresh);
    }
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** 다시 시도할 수 있을 때까지 남은 시간(초) */
  retryAfterSeconds: number;
};

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();

  // 요청이 뜸할 때만 가볍게 정리합니다.
  if (hits.size > 500) prune(now);

  const times = (hits.get(identifier) ?? []).filter((time) => now - time < WINDOW_MS);

  if (times.length >= MAX_REQUESTS) {
    const oldest = times[0];
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);

    hits.set(identifier, times);

    return { allowed: false, retryAfterSeconds };
  }

  times.push(now);
  hits.set(identifier, times);

  return { allowed: true, retryAfterSeconds: 0 };
}

/** 요청을 보낸 방문자를 구분할 값을 찾습니다. (배포 환경마다 헤더가 다릅니다) */
export function getClientIdentifier(request: Request): string {
  const headers = request.headers;

  return (
    headers.get("x-nf-client-connection-ip") ?? // Netlify
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
