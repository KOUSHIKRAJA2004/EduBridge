import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import UserTypes from "@/components/landing/UserTypes";
import SuccessStories from "@/components/landing/SuccessStories";
import Stats from "@/components/landing/Stats";
import CTASection from "@/components/landing/CTASection";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <UserTypes />
        <SuccessStories />
        <Stats />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
