"use client";

import Header from "./landing/Header";
import HeroSection from "./landing/HeroSection";
import ByeDeclarationSection from "./landing/ByeDeclarationSection";
import AgentCatalogSection from "./landing/AgentCatalogSection";
import HowItWorks from "./landing/HowItWorks";
import SecuritySection from "./landing/SecuritySection";
import FinalCTASection from "./landing/GitHubCTASection";
import Footer from "./landing/Footer";

// HIAI Agent Hub — "Hi AI. Bye 반복업무."
// 구조: Header / Hero / Bye Declaration / Agent Catalog / How / Security / Final CTA / Footer
export default function Landing({ msg }: { msg?: string | null }) {
  return (
    <div className="-mx-5">
      <Header />
      <HeroSection msg={msg} />
      <ByeDeclarationSection />
      <AgentCatalogSection />
      <HowItWorks />
      <SecuritySection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
