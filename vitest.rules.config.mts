/** Firestore 보안 규칙 테스트 전용 설정 (에뮬레이터 필요: npm run test:rules) */
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.rules.test.ts"],
    // 테스트끼리 같은 에뮬레이터 데이터를 쓰므로 순서대로 실행합니다.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
