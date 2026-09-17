/**
 * page.tsx — 랜딩페이지의 섹션 순서를 정의합니다.
 * 섹션 순서를 바꾸고 싶다면 아래 줄의 순서만 바꾸면 됩니다.
 */
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
  return (
    <>
      <SiteHeader />

      <main id="main">
        <Hero />
        <EmpathySection />
        <WhyHabit />
        <Roadmap />
        <HabitSystem />
        <Testimonials />
        <FAQ />
        <SignupForm />
      </main>

      <Footer />
      <StickyCTA />
    </>
  );
}
