import { NavHeader }       from "@/app/components/layout/NavHeader";
import { HeroSection }      from "@/app/components/sections/HeroSection";
import { ScopeSection }     from "@/app/components/sections/ScopeSection";
import { MentorsSection }   from "@/app/components/sections/MentorsSection";
import { ScheduleSection }  from "@/app/components/sections/ScheduleSection";
import { InvestmentSection} from "@/app/components/sections/InvestmentSection";
import { ContactSection }   from "@/app/components/sections/ContactSection";
import { LeadPopup }         from "@/app/components/LeadPopup";

export default function LandingPage() {
  return (
    <>
      <NavHeader />
      <main>
        <HeroSection />
        <ScopeSection />
        <MentorsSection />
        <ScheduleSection />
        <InvestmentSection />
        <ContactSection />
      </main>
      {/* Pop-up de captura de lead — aberto por qualquer LeadCaptureCta */}
      <LeadPopup />
    </>
  );
}
