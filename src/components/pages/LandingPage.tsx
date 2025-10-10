import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  HeroSection,
  FeaturesSection,
  ServicesSection,
  CTASection,
} from "@/components/home";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
