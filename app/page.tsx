/**
 * page.tsx — 랜딩페이지의 섹션 순서를 정의합니다.
 * 섹션 순서를 바꾸고 싶다면 아래 줄의 순서만 바꾸면 됩니다.
 */
import { AiCoach } from "@/components/AiCoach";
import { EmpathySection } from "@/components/EmpathySection";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { HabitSystem } from "@/components/HabitSystem";
import { Hero } from "@/components/Hero";
import { Roadmap } from "@/components/Roadmap";
import { SignupForm } from "@/components/SignupForm";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyCTA } from "@/components/StickyCTA";
import { Testimonials } from "@/components/Testimonials";
import { WhyHabit } from "@/components/WhyHabit";

export default function HomePage() {
  // 운영자가 서버에 Gemini 키를 등록해 뒀는지 확인합니다.
  // (키 값 자체는 브라우저로 보내지 않고, 있는지 여부만 전달합니다)
  const hasServerKey = Boolean(process.env.GEMINI_API_KEY?.trim());

  return (
    <>
      <SiteHeader />

      <main id="main">
        <Hero />
        <EmpathySection />
        <WhyHabit />
        <Roadmap />
        <HabitSystem />
        <AiCoach hasServerKey={hasServerKey} />
        <Testimonials />
        <FAQ />
        <SignupForm />
      </main>

      <Footer />
      <StickyCTA />
    </>
  );
}
