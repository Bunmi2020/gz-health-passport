import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { JourneySection } from "@/components/sections/JourneySection";
import { PricingSection } from "@/components/sections/PricingSection";
import { BookingSection } from "@/components/sections/BookingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { ContactSection } from "@/components/sections/ContactSection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <JourneySection />
      <PricingSection />
      <BookingSection />
      <FAQSection />
      <ContactSection />
    </main>
  );
};

export default Index;
