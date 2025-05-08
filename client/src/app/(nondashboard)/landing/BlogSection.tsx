"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronRight } from "lucide-react";

// Sample blog posts for the homepage
const featuredBlogPosts = [
  {
    id: 1,
    title: "How to Find the Perfect Student Accommodation",
    excerpt: "Finding the right student accommodation can be challenging. Here are our top tips for securing the perfect place.",
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    date: "May 5, 2025",
    readTime: "5 min read",
    category: "Student Housing"
  },
  {
    id: 2,
    title: "5 Things to Check Before Signing a Lease Agreement",
    excerpt: "Don&apos;t get caught in a bad rental situation. Make sure to check these 5 important things before signing any lease.",
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    date: "April 28, 2025",
    readTime: "7 min read",
    category: "Rental Tips"
  },
  {
    id: 3,
    title: "The Rise of Co-living Spaces in South Africa",
    excerpt: "Co-living is becoming increasingly popular among young professionals. Learn about this growing trend.",
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    date: "April 15, 2025",
    readTime: "6 min read",
    category: "Housing Trends"
  }
];

const BlogSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest from Our Blog</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest trends, tips, and insights about rental properties and housing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredBlogPosts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  className="object-cover"
                  fill
                />
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 m-2 rounded">
                  {post.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {post.date}
                  </span>
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{post.excerpt}</p>
                <Link href={`/blog/${post.id}`}>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 p-0 h-auto">
                    Read More
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/blog">
            <Button className="bg-blue-600 hover:bg-blue-700">
              View All Articles
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
