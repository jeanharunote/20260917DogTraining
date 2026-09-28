/**
 * (app) 그룹 레이아웃 — 로그인 후 쓰는 페이지들(/apply, /me, /feed, /admin)의 공통 틀입니다.
 * 괄호로 묶인 폴더 이름은 주소에 나타나지 않습니다. (예: /me)
 */
import { AppHeader } from "@/components/app/AppHeader";
import { AuthProvider } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface-muted">
        <AppHeader />
        <main id="main" className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:pt-12">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
