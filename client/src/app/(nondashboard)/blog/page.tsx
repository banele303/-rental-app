"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Clock, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Sample blog data - in a real app, this would come from an API
const blogPosts = [
  {
    id: 1,
    title: "How to Find the Perfect Student Accommodation",
    excerpt: "Finding the right student accommodation can be challenging. Here are our top tips for securing the perfect place.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Sarah Johnson",
    date: "May 5, 2025",
    readTime: "5 min read",
    category: "Student Housing"
  },
  {
    id: 2,
    title: "5 Things to Check Before Signing a Lease Agreement",
    excerpt: "Don&apos;t get caught in a bad rental situation. Make sure to check these 5 important things before signing any lease.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Michael Chen",
    date: "April 28, 2025",
    readTime: "7 min read",
    category: "Rental Tips"
  },
  {
    id: 3,
    title: "The Rise of Co-living Spaces in South Africa",
    excerpt: "Co-living is becoming increasingly popular among young professionals. Learn about this growing trend.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Thabo Mbeki",
    date: "April 15, 2025",
    readTime: "6 min read",
    category: "Housing Trends"
  },
  {
    id: 4,
    title: "Decorating Your Rental on a Budget",
    excerpt: "Make your rental feel like home without breaking the bank with these budget-friendly decorating tips.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Jessica Smith",
    date: "April 10, 2025",
    readTime: "4 min read",
    category: "Interior Design"
  },
  {
    id: 5,
    title: "Understanding Rental Laws in South Africa",
    excerpt: "A comprehensive guide to tenant rights and responsibilities under South African rental laws.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "David Makhura",
    date: "March 30, 2025",
    readTime: "8 min read",
    category: "Legal"
  },
  {
    id: 6,
    title: "The Future of Smart Homes in Rental Properties",
    excerpt: "How technology is transforming rental properties and what to expect in the coming years.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Lerato Khumalo",
    date: "March 22, 2025",
    readTime: "5 min read",
    category: "Technology"
  }
];

// Categories for filtering
const categories = [
  "All",
  "Student Housing",
  "Rental Tips",
  "Housing Trends",
  "Interior Design",
  "Legal",
  "Technology"
];

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Filter posts based on search term and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Featured post is the first one
  const featuredPost = blogPosts[0];
  
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Rental App Blog</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Stay informed with the latest trends, tips, and insights about rental properties and housing.
            </p>
          </div>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-blue-600" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Featured Post */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-3">Featured Article</h2>
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="md:flex">
              <div className="md:w-1/2 relative h-64 md:h-auto">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="object-cover"
                  fill
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center">
                    <User size={14} className="mr-1" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{featuredPost.title}</h3>
                <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                <Link href={`/blog/${featuredPost.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Read Full Article
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blog Posts Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-3">Latest Articles</h2>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
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
                  <div className="p-5">
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
                    <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                        <span className="text-sm font-medium">{post.author}</span>
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <p className="text-gray-500">No articles found matching your search criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
        
        {/* Newsletter Subscription */}
        <div className="mt-16 bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-8 text-white">
          <div className="md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p>Get the latest articles, tips and housing trends delivered to your inbox.</p>
            </div>
            <div className="md:w-1/3 flex">
              <Input
                type="email"
                placeholder="Your email address"
                className="rounded-r-none text-gray-900"
              />
              <Button className="rounded-l-none bg-blue-900 hover:bg-blue-950">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
