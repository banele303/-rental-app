"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ArrowRight, ArrowUpRight } from "lucide-react";

interface AnimatedButtonProps {
  as?: React.ElementType;
  icon: React.ReactNode;
  text: string;
  iconPosition?: "left" | "right";
  [key: string]: any;
}

interface StatsCardProps {
  number: string;
  label: string;
}

const CallToActionSection = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <Image
          src="/landing-call-to-action.jpg"
          alt="Rental Property Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-purple-500 blur-3xl"></div>
        </div>
      </motion.div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-blue-200 mb-6">
              Your Dream Home Awaits
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                Find Your Perfect
              </span> <br />
              Rental Property Today
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Discover a wide range of rental properties in your desired location. 
              Our platform connects you with verified listings and trusted landlords.
            </p>

            <div className="flex flex-wrap gap-4">
              <AnimatedButton
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center justify-center bg-white text-gray-900 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
                icon={<Search size={18} className="mr-2" />}
                text="Start Searching"
              />
              
              <AnimatedButton
                as={Link}
                href="/signup"
                scroll={false}
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                icon={<ArrowUpRight size={18} className="ml-2" />}
                text="Sign Up Now"
                iconPosition="right"
              />
            </div>
          </motion.div>

          {/* Right Column - Stats/Features Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <StatsCard number="10k+" label="Verified Listings" />
              <StatsCard number="98%" label="Satisfaction Rate" />
            </div>
            
            <FeaturedTestimonial />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Stats Card Component
const StatsCard = ({ number, label }: StatsCardProps) => (
  <motion.div
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
  >
    <p className="text-3xl font-bold text-white mb-1">{number}</p>
    <p className="text-gray-300 text-sm">{label}</p>
  </motion.div>
);

// Featured Testimonial Component
const FeaturedTestimonial = () => (
  <motion.div
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
  >
    <div className="flex items-center mb-4">
      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-blue-400">
        <Image
          src="/api/placeholder/100/100"
          alt="User"
          fill
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-white font-medium">Sarah Johnson</p>
        <p className="text-gray-300 text-sm">New York, NY</p>
      </div>
    </div>
    <p className="text-gray-200 italic text-sm">
    &quot;I found my dream apartment in just 3 days using this platform. The verification process gave me confidence in my choice!&quot;
    </p>
  </motion.div>
);

// Animated Button Component
const AnimatedButton = ({ as: Component = 'button', icon, text, iconPosition = "left", ...props }: AnimatedButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Component
      {...props}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {iconPosition === "left" && icon}
      <span className={`${iconPosition === "right" ? "mr-2" : "ml-2"}`}>{text}</span>
      {iconPosition === "right" && (
        <motion.div
          animate={{ x: isHovered ? 3 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      )}
    </Component>
  );
};

export default CallToActionSection;