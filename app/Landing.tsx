"use client";

import Header from "./landing/Header";
import HeroSection from "./landing/HeroSection";
import AgentCatalogSection from "./landing/AgentCatalogSection";
import HowItWorks from "./landing/HowItWorks";
import SecuritySection from "./landing/SecuritySection";
import UseCaseSection from "./landing/UseCaseSection";
import GitHubCTASection from "./landing/GitHubCTASection";
import Footer from "./landing/Footer";

// 개인 업무 자동화를 위한 AI Agent Hub
// 구조: Header / Hero / Agent Catalog / How It Works / Security / Use Cases / GitHub CTA / Footer
export default function Landing({ msg }: { msg?: string | null }) {
  return (
    <div className="-mx-5">
      <Header />
      <HeroSection msg={msg} />
      <AgentCatalogSection />
      <HowItWorks />
      <SecuritySection />
      <UseCaseSection />
      <GitHubCTASection />
      <Footer />
    </div>
  );
}
