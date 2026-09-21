import { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import EcosystemSection from "../components/landing/EcosystemSection";
import ParticipantsSection from "../components/landing/ParticipantsSection";
import HowItWorks from "../components/landing/HowItWorks";
import BenefitsSection from "../components/landing/BenefitsSection";
import ProduceShowcase from "../components/landing/ProduceShowcase";
import TrustSection from "../components/landing/TrustSection";
import FinalCTA from "../components/landing/FinalCTA";
import LandingFooter from "../components/landing/LandingFooter";

export function LandingPage() {
  useEffect(() => {
    document.title = "KIRAN | Connecting Farmers, FPOs & Direct Buyers for Smarter Agricultural Trade";
  }, []);

  return (
    <div className="min-h-screen w-full bg-white text-stone-900 font-sans antialiased overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Compact Navbar */}
      <LandingNavbar />

      {/* Main Public Content */}
      <main id="main-content">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Trade Ecosystem: How Farmer, FPO & Buyer Connect */}
        <EcosystemSection />

        {/* 4. Who Uses KIRAN: Designed for the Entire Agricultural Value Chain */}
        <ParticipantsSection />

        {/* 5. How KIRAN Works: 7 Compact Steps (4 on Row 1, 3 on Row 2) */}
        <HowItWorks />

        {/* 6. Benefits: Built to Solve Real Agri-Trade Inefficiencies (3x2 Grid) */}
        <BenefitsSection />

        {/* 7. Active Commodities Traded Across KIRAN */}
        <ProduceShowcase />

        {/* 8. Trust: Authentic Verification & Transparent Trade Enforcement */}
        <TrustSection />

        {/* 9. Final CTA: Ready to Make Agricultural Trade Smarter? */}
        <FinalCTA />
      </main>

      {/* 10. Compact Footer */}
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
