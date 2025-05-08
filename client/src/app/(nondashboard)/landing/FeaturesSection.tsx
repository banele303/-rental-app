"use client"

import type React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const FeaturesSection = () => {
  const features = [
    {
      imageSrc: "/landing-search3.png",
      title: "Trustworthy and Verified Listings",
      description: "Discover the best rental options with user reviews and ratings.",
      linkText: "Explore",
      linkHref: "/explore",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      icon: "🏠",
    },
    {
      imageSrc: "/landing-search2.png",
      title: "Browse Rental Listings with Ease",
      description: "Get access to user reviews and ratings for a better understanding of rental options.",
      linkText: "Search",
      linkHref: "/search",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      icon: "🔍",
    },
    {
      imageSrc: "/landing-search1.png",
      title: "Simplify Your Rental Search",
      description: "Find trustworthy and verified rental listings to ensure a hassle-free experience.",
      linkText: "Discover",
      linkHref: "/discover",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      icon: "✨",
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 bg-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-blue-400 text-slate-700 text-sm font-medium">
            Powerful Tools
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 max-w-2xl mx-auto">
            Find Any Residence with Our Powerful Search Tools
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Quickly find the home you want using our effective search filters and verified listings!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

interface FeatureCardProps {
  imageSrc: string
  title: string
  description: string
  linkText: string
  linkHref: string
  iconBg: string
  iconColor: string
  icon: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  imageSrc,
  title,
  description,
  linkText,
  linkHref,
  iconBg,
  iconColor,
  icon,
}) => {
  return (
    <motion.div
      className="bg-white border border-slate-100 rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-slate-200 hover:shadow-sm"
      whileHover={{ y: -4 }}
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={imageSrc || "/placeholder.svg"}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          alt={title}
        />
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className={`w-10 h-10 ${iconBg} ${iconColor} rounded-lg flex items-center justify-center text-lg mb-4`}>
          {icon}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>

        <p className="text-slate-600 text-sm mb-5 flex-grow">{description}</p>

        <Link
          href={linkHref}
          className="group inline-flex items-center text-sm font-medium text-slate-900 hover:text-slate-700"
        >
          {linkText}
          <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </motion.div>
  )
}

export default FeaturesSection
