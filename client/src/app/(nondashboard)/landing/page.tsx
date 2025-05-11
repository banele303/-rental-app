import React from "react";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import DiscoverSection from "./DiscoverSection";
import CallToActionSection from "./CallToActionSection";
import FooterSection from "./FooterSection";
import CityCard from "./CitySelection";
import HomeListings from "@/components/HomeProperties";
import BlogSection from "./BlogSection";

function Landing() {
  return (
    <div>
      <HeroSection />
      <CityCard />
      {/* <HomeListings/> */}
      <FeaturesSection />
      <BlogSection />
      {/* <DiscoverSection/> */}
      <CallToActionSection />
      <FooterSection />
    </div>
  );
}

export default Landing;
