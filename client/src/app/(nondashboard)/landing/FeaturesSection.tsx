"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1], // Improved ease curve for more elegant motion
    }
  },
};

const FeaturesSection = () => {
  const features = [
    {
      imageSrc: "/landing-search3.png",
      title: "Trustworthy and Verified Listings",
      description: "Discover the best rental options with user reviews and ratings.",
      linkText: "Explore",
      linkHref: "/explore",
      accent: "bg-gradient-to-r from-blue-500 to-indigo-600",
      icon: "🏠"
    },
    {
      imageSrc: "/landing-search2.png",
      title: "Browse Rental Listings with Ease",
      description: "Get access to user reviews and ratings for a better understanding of rental options.",
      linkText: "Search",
      linkHref: "/search",
      accent: "bg-gradient-to-r from-emerald-500 to-teal-600",
      icon: "🔍"
    },
    {
      imageSrc: "/landing-search1.png",
      title: "Simplify Your Rental Search",
      description: "Find trustworthy and verified rental listings to ensure a hassle-free experience.",
      linkText: "Discover",
      linkHref: "/discover",
      accent: "bg-gradient-to-r from-amber-500 to-orange-600",
      icon: "✨"
    }
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-block mb-3 px-4 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-medium">
            Powerful Tools
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4 max-w-3xl mx-auto leading-tight">
            Find Any Residence with Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Powerful Search Tools</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quickly find the home you want using our effective search filters and verified listings!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="h-full"
            >
              <FeatureCard {...feature} delay={index * 0.1} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

interface FeatureCardProps {
  imageSrc: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  accent: string;
  icon: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  imageSrc,
  title,
  description,
  linkText,
  linkHref,
  accent,
  icon,
  delay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="bg-white rounded-2xl overflow-hidden h-full flex flex-col shadow-md hover:shadow-xl transition-all duration-500"
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      initial={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
      animate={{ boxShadow: isHovered ? 
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" : 
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
      }}
      transition={{ delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-2 ${accent}`}></div>
      
      <div className="relative overflow-hidden h-48 sm:h-56">
        <Image
          src={imageSrc}
          fill
          className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          alt={title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute bottom-4 left-4 flex items-center">
          <span className="w-10 h-10 flex items-center justify-center text-lg rounded-full bg-white shadow-lg">
            {icon}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 text-base mb-6 flex-grow">
          {description}
        </p>
        
        <Link
          href={linkHref}
          className={`group inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-white ${accent} hover:opacity-90 transition-all duration-300`}
          scroll={false}
        >
          <span>{linkText}</span>
          <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </motion.div>
  );
};

export default FeaturesSection;