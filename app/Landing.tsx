"use client";

import Header from "./landing/Header";
import HeroSection from "./landing/HeroSection";
import ProblemStickySection from "./landing/ProblemStickySection";
import SolutionPipeline from "./landing/SolutionPipeline";
import AgentCatalogSection from "./landing/AgentCatalogSection";
import ProductDemoSection from "./landing/ProductDemoSection";
import FeatureGrid from "./landing/FeatureGrid";
import UseCaseSection from "./landing/UseCaseSection";
import SecuritySection from "./landing/SecuritySection";
import HowItWorks from "./landing/HowItWorks";
import PricingCTA from "./landing/PricingCTA";
import Footer from "./landing/Footer";

// Toss / Linear / Stripe / Framer 풍 다크 네이비 B2B SaaS 랜딩
// 컨셉: AI 자동화 자판기 · 신뢰감 있는 표현 · 사용자 실행 환경 강조
export default function Landing({ msg }: { msg?: string | null }) {
  return (
    <div className="-mx-5">
      <Header />
      <HeroSection msg={msg} />
      <ProblemStickySection />
      <SolutionPipeline />
      <AgentCatalogSection />
      <ProductDemoSection />
      <FeatureGrid />
      <UseCaseSection />
      <SecuritySection />
      <HowItWorks />
      <PricingCTA />
      <Footer />
    </div>
  );
}
