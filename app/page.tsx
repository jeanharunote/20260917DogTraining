/**
 * page.tsx — 랜딩페이지의 섹션 순서를 정의합니다.
 * 섹션 순서를 바꾸고 싶다면 아래 줄의 순서만 바꾸면 됩니다.
 */
import { DepositSection } from "@/components/DepositSection";
import { EmpathySection } from "@/components/EmpathySection";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { HabitSystem } from "@/components/HabitSystem";
import { Hero } from "@/components/Hero";
import { MyStory } from "@/components/MyStory";
import { Roadmap } from "@/components/Roadmap";
import { SignupForm } from "@/components/SignupForm";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyCTA } from "@/components/StickyCTA";
import { WhyHabit } from "@/components/WhyHabit";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        <Hero />
        <EmpathySection />
        <MyStory />
        <WhyHabit />
        <Roadmap />
        <HabitSystem />
        <DepositSection />
        <FAQ />
        <SignupForm />
      </main>

      <Footer />
      <StickyCTA />
    </>
  );
}
