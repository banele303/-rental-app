import React from 'react'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import DiscoverSection from './DiscoverSection'
import CallToActionSection from './CallToActionSection'
import FooterSection from './FooterSection'
import HomeListings from '@/components/HomeProperties'

function Landing() {
  return (
    <div>
      <HeroSection/>
      {/* <HomeListings/> */}
      <FeaturesSection/>
      {/* <DiscoverSection/> */}
      <CallToActionSection/>
      <FooterSection/>
    </div>
  )
}

export default Landing