"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, User, Clock, ArrowLeft, Share2, Bookmark, MessageSquare } from "lucide-react";

// Sample blog data - in a real app, this would come from an API
const blogPosts = [
  {
    id: 1,
    title: "How to Find the Perfect Student Accommodation",
    excerpt: "Finding the right student accommodation can be challenging. Here are our top tips for securing the perfect place.",
    content: `
      <p>Finding the right student accommodation is a crucial part of your university experience. It's not just about having a place to sleep; it's about creating a home that supports your academic journey and personal growth.</p>
      
      <h2>Start Your Search Early</h2>
      <p>The best accommodations get snapped up quickly. Begin your search at least 3-4 months before the start of the academic year to have the most options available to you.</p>
      
      <h2>Consider Location Carefully</h2>
      <p>Proximity to your campus is important, but also consider access to public transportation, grocery stores, healthcare facilities, and recreational areas. A slightly longer commute might be worth it for better amenities or lower rent.</p>
      
      <h2>Budget Realistically</h2>
      <p>Remember to account for all expenses: rent, utilities, internet, transportation, groceries, and leisure activities. Many students underestimate their total monthly expenses.</p>
      
      <h2>Check Security Features</h2>
      <p>Ensure the accommodation has adequate security measures like proper locks, security personnel, or controlled access systems. Your safety should be a top priority.</p>
      
      <h2>Read Reviews and Ask Questions</h2>
      <p>Look for reviews from current or previous tenants. Don&apos;t hesitate to ask the landlord or property manager detailed questions about the property, neighborhood, and lease terms.</p>
      
      <h2>Inspect Before Committing</h2>
      <p>Always visit the property in person before signing any agreement. Check for issues like mold, water damage, electrical problems, or pest infestations.</p>
      
      <p>By following these guidelines, you'll be better equipped to find student accommodation that meets your needs and enhances your university experience.</p>
    `,
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Sarah Johnson",
    date: "May 5, 2025",
    readTime: "5 min read",
    category: "Student Housing",
    tags: ["Student Life", "Accommodation", "Housing Tips", "University"]
  },
  {
    id: 2,
    title: "5 Things to Check Before Signing a Lease Agreement",
    excerpt: "Don&apos;t get caught in a bad rental situation. Make sure to check these 5 important things before signing any lease.",
    content: `
      <p>Signing a lease agreement is a significant financial and legal commitment. Before you put pen to paper, make sure you've thoroughly checked these five critical aspects:</p>
      
      <h2>1. Understand All Fees and Costs</h2>
      <p>Beyond the monthly rent, be clear about security deposits, application fees, late payment penalties, and any other potential costs. Ask if utilities are included or separate, and get estimates for typical monthly utility expenses.</p>
      
      <h2>2. Know Your Lease Terms</h2>
      <p>Carefully read the entire lease agreement. Pay special attention to the lease duration, renewal options, early termination clauses, and any restrictions on guests, pets, or property modifications.</p>
      
      <h2>3. Document Existing Damage</h2>
      <p>Before moving in, thoroughly document any existing damage with photos and detailed notes. Have the landlord acknowledge this documentation to avoid disputes when you move out.</p>
      
      <h2>4. Clarify Maintenance Responsibilities</h2>
      <p>Understand who is responsible for various maintenance tasks, from changing light bulbs to major repairs. Know the process for requesting repairs and the expected response time.</p>
      
      <h2>5. Research the Landlord and Property</h2>
      <p>Look up reviews from previous tenants and check if there are any complaints filed against the landlord or property management company. Visit the property at different times of day to assess noise levels and neighborhood activity.</p>
      
      <p>Taking the time to thoroughly check these five aspects before signing a lease can save you from significant headaches and financial losses down the road. Remember, a lease is a binding legal document, so make sure you're comfortable with all its terms before committing.</p>
    `,
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Michael Chen",
    date: "April 28, 2025",
    readTime: "7 min read",
    category: "Rental Tips",
    tags: ["Lease Agreement", "Rental Tips", "Legal Advice", "Housing"]
  },
  {
    id: 3,
    title: "The Rise of Co-living Spaces in South Africa",
    excerpt: "Co-living is becoming increasingly popular among young professionals. Learn about this growing trend.",
    content: `
      <p>Co-living has emerged as a significant trend in South Africa's housing market, particularly in urban centers like Johannesburg, Cape Town, and Durban. This modern housing concept offers an innovative solution to the challenges of urban living.</p>
      
      <h2>What is Co-living?</h2>
      <p>Co-living spaces are purpose-built or converted residential properties where residents have private bedrooms but share common areas such as kitchens, living rooms, and sometimes bathrooms. These spaces often come fully furnished and include utilities and services in the monthly rent.</p>
      
      <h2>Why is Co-living Growing in South Africa?</h2>
      <p>Several factors contribute to the rising popularity of co-living in South Africa:</p>
      <ul>
        <li><strong>Affordability:</strong> With rising property prices in urban areas, co-living offers a more affordable alternative to traditional rentals.</li>
        <li><strong>Flexibility:</strong> Many co-living spaces offer flexible lease terms, appealing to mobile professionals and digital nomads.</li>
        <li><strong>Community:</strong> In an increasingly disconnected world, co-living provides built-in social connections and networking opportunities.</li>
        <li><strong>Convenience:</strong> All-inclusive pricing and amenities simplify budgeting and eliminate the hassle of setting up utilities and furnishing a home.</li>
      </ul>
      
      <h2>Who is Choosing Co-living?</h2>
      <p>While initially popular among young professionals and students, co-living is attracting a diverse range of residents:</p>
      <ul>
        <li>Young professionals seeking networking opportunities and affordable housing in prime locations</li>
        <li>Remote workers and digital nomads needing flexible living arrangements</li>
        <li>Newcomers to cities looking for an instant community</li>
        <li>Older adults seeking community and shared resources</li>
      </ul>
      
      <h2>The Future of Co-living in South Africa</h2>
      <p>As urban housing challenges persist and work patterns continue to evolve, co-living is likely to become an established housing category in South Africa. Developers are increasingly incorporating co-living concepts into their projects, and regulatory frameworks are beginning to adapt to this new housing model.</p>
      
      <p>Whether co-living represents a temporary housing solution or a long-term lifestyle choice, its growth reflects changing attitudes toward home, community, and urban living in South Africa.</p>
    `,
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Thabo Mbeki",
    date: "April 15, 2025",
    readTime: "6 min read",
    category: "Housing Trends",
    tags: ["Co-living", "Housing Trends", "South Africa", "Urban Living"]
  },
  {
    id: 4,
    title: "Decorating Your Rental on a Budget",
    excerpt: "Make your rental feel like home without breaking the bank with these budget-friendly decorating tips.",
    content: `
      <p>Transforming a rental property into a space that feels like home doesn't have to drain your bank account. With some creativity and strategic shopping, you can create a stylish and personalized space while staying within budget and respecting your lease agreement.</p>
      
      <h2>Temporary Wallpaper and Decals</h2>
      <p>Peel-and-stick wallpaper and wall decals can dramatically transform a space without damaging walls. Apply them to create accent walls, faux headboards, or decorative patterns. They're completely removable when it's time to move out.</p>
      
      <h2>Strategic Textiles</h2>
      <p>Textiles are one of the most cost-effective ways to add color, pattern, and texture to your space. Invest in throw pillows, area rugs, curtains, and throws that can move with you to your next home. Look for sales or consider second-hand options for high-quality pieces at lower prices.</p>
      
      <h2>Lighting Makeovers</h2>
      <p>Many rentals come with basic or outdated lighting fixtures. Without changing the actual fixtures, you can transform the lighting by:</p>
      <ul>
        <li>Adding table and floor lamps for layered lighting</li>
        <li>Using smart bulbs that change color and intensity</li>
        <li>Installing plug-in pendant lights or sconces that don&apos;t require hardwiring</li>
        <li>Adding string lights for ambiance</li>
      </ul>
      
      <h2>Furniture Hacks</h2>
      <p>You don&apos;t need to buy all new furniture for your rental:</p>
      <ul>
        <li>Refresh existing pieces with paint, new hardware, or contact paper</li>
        <li>Look for versatile, modular pieces that can adapt to different spaces</li>
        <li>Consider furniture rental for temporary situations</li>
        <li>Explore second-hand markets for unique, affordable finds</li>
      </ul>
      
      <h2>Plants and Natural Elements</h2>
      <p>Houseplants instantly make a space feel more alive and personal. If you're new to plant care, start with low-maintenance options like snake plants, pothos, or ZZ plants. Thrift stores often have interesting planters at bargain prices.</p>
      
      <p>Remember, the goal is to create a space that feels like yours without making permanent changes that could affect your security deposit. With these budget-friendly approaches, you can enjoy a personalized home environment without overcommitting financially or violating your lease terms.</p>
    `,
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Jessica Smith",
    date: "April 10, 2025",
    readTime: "4 min read",
    category: "Interior Design",
    tags: ["Budget Decorating", "Rental Tips", "Interior Design", "DIY"]
  },
  {
    id: 5,
    title: "Understanding Rental Laws in South Africa",
    excerpt: "A comprehensive guide to tenant rights and responsibilities under South African rental laws.",
    content: `
      <p>Navigating the legal landscape of renting in South Africa can be complex. Understanding your rights and responsibilities as a tenant is essential for a positive rental experience and for protecting yourself from potential disputes.</p>
      
      <h2>The Rental Housing Act</h2>
      <p>The primary legislation governing residential tenancies in South Africa is the Rental Housing Act 50 of 1999, as amended. This Act establishes the framework for the relationship between landlords and tenants, including:</p>
      <ul>
        <li>The establishment of Rental Housing Tribunals to resolve disputes</li>
        <li>Requirements for lease agreements</li>
        <li>Regulations regarding deposits</li>
        <li>Maintenance responsibilities</li>
        <li>Protections against unfair discrimination</li>
      </ul>
      
      <h2>Lease Agreements</h2>
      <p>While verbal lease agreements are legally binding in South Africa, written agreements provide better protection for both parties. A comprehensive lease agreement should include:</p>
      <ul>
        <li>Names and contact details of all parties</li>
        <li>Property description and address</li>
        <li>Rental amount and payment terms</li>
        <li>Deposit amount and conditions for refund</li>
        <li>Lease duration and renewal terms</li>
        <li>Maintenance responsibilities</li>
        <li>House rules and restrictions</li>
        <li>Termination conditions</li>
      </ul>
      
      <h2>Deposits and Fees</h2>
      <p>Landlords typically require a security deposit equal to one or two months' rent. This deposit must be:</p>
      <ul>
        <li>Held in an interest-bearing account</li>
        <li>Refunded within 7 days of the end of the lease (if there are no damages or outstanding amounts)</li>
        <li>Accompanied by a detailed list of deductions if not refunded in full</li>
      </ul>
      
      <h2>Maintenance and Repairs</h2>
      <p>Generally, landlords are responsible for maintaining the structural integrity of the property and ensuring it remains habitable. Tenants are typically responsible for day-to-day maintenance and repairing any damage they cause beyond normal wear and tear.</p>
      
      <h2>Termination of Leases</h2>
      <p>Fixed-term leases cannot be terminated early without potential penalties unless:</p>
      <ul>
        <li>Both parties agree</li>
        <li>The tenant has a valid reason as specified in the Consumer Protection Act</li>
        <li>The landlord has breached the agreement</li>
      </ul>
      
      <h2>Dispute Resolution</h2>
      <p>If you have a dispute with your landlord, the Rental Housing Tribunal in your province should be your first recourse. These tribunals offer free mediation and adjudication services for rental disputes.</p>
      
      <p>Understanding these legal aspects of renting in South Africa will help you navigate your tenancy with confidence and know when and how to assert your rights if necessary.</p>
    `,
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "David Makhura",
    date: "March 30, 2025",
    readTime: "8 min read",
    category: "Legal",
    tags: ["Rental Laws", "Tenant Rights", "South African Law", "Legal Advice"]
  },
  {
    id: 6,
    title: "The Future of Smart Homes in Rental Properties",
    excerpt: "How technology is transforming rental properties and what to expect in the coming years.",
    content: `
      <p>Smart home technology is rapidly changing the rental property landscape in South Africa and globally. As these technologies become more affordable and accessible, they're increasingly becoming standard features in rental properties, benefiting both landlords and tenants.</p>
      
      <h2>Current Smart Home Trends in Rentals</h2>
      <p>Several smart home features are already becoming common in rental properties:</p>
      <ul>
        <li><strong>Smart locks:</strong> Allowing keyless entry and remote access management</li>
        <li><strong>Smart thermostats:</strong> Enabling energy-efficient climate control</li>
        <li><strong>Security cameras:</strong> Providing enhanced security and monitoring</li>
        <li><strong>Smart lighting:</strong> Offering convenience and energy savings</li>
        <li><strong>Water leak detectors:</strong> Preventing costly water damage</li>
      </ul>
      
      <h2>Benefits for Tenants</h2>
      <p>Smart home features offer numerous advantages for renters:</p>
      <ul>
        <li><strong>Convenience:</strong> Control home features remotely or with voice commands</li>
        <li><strong>Cost savings:</strong> Reduce utility bills through efficient energy and water use</li>
        <li><strong>Enhanced security:</strong> Monitor your home and receive alerts about potential issues</li>
        <li><strong>Improved comfort:</strong> Customize your living environment to your preferences</li>
      </ul>
      
      <h2>Benefits for Landlords</h2>
      <p>Property owners also gain significant advantages from smart home implementations:</p>
      <ul>
        <li><strong>Property value increase:</strong> Smart features can justify higher rental rates</li>
        <li><strong>Reduced maintenance costs:</strong> Early detection of issues prevents expensive repairs</li>
        <li><strong>Improved tenant satisfaction:</strong> Leading to longer tenancies and fewer vacancies</li>
        <li><strong>Remote property management:</strong> Monitor and manage properties more efficiently</li>
      </ul>
      
      <h2>Future Developments</h2>
      <p>Looking ahead, we can expect several developments in smart rental properties:</p>
      <ul>
        <li><strong>Integrated property management systems:</strong> Combining tenant communication, maintenance requests, and smart home controls in one platform</li>
        <li><strong>AI-powered predictive maintenance:</strong> Systems that can predict and prevent maintenance issues before they occur</li>
        <li><strong>Sustainability features:</strong> Smart water recycling, solar integration, and advanced energy management</li>
        <li><strong>Health and wellness technology:</strong> Air quality monitoring, circadian lighting, and other features that promote tenant wellbeing</li>
      </ul>
      
      <h2>Considerations for Tenants</h2>
      <p>If you're renting a smart-enabled property, consider these factors:</p>
      <ul>
        <li>Privacy policies regarding data collection from smart devices</li>
        <li>Clarity about who controls which features and settings</li>
        <li>Procedures for troubleshooting and technical support</li>
        <li>Responsibilities for maintaining and updating smart systems</li>
      </ul>
      
      <p>As smart home technology continues to evolve, it's transforming the rental experience for both landlords and tenants. Those who embrace these changes stand to benefit from more efficient, comfortable, and secure living environments.</p>
    `,
    image: "https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png",
    author: "Lerato Khumalo",
    date: "March 22, 2025",
    readTime: "5 min read",
    category: "Technology",
    tags: ["Smart Homes", "Property Technology", "Future Trends", "Rental Properties"]
  }
];

const BlogPostDetail = () => {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);
  
  // Find the blog post with the matching ID
  const post = blogPosts.find(post => post.id === postId);
  
  // If no post is found, show a message
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="mb-6">The blog post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => router.push('/blog')} className="bg-blue-600 hover:bg-blue-700">
          <ArrowLeft size={16} className="mr-2" />
          Back to Blog
        </Button>
      </div>
    );
  }
  
  // Related posts (excluding the current post)
  const relatedPosts = blogPosts
    .filter(p => p.id !== postId && p.category === post.category)
    .slice(0, 2);
  
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 text-sm mb-3">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                {post.category}
              </span>
              <span className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {post.date}
              </span>
              <span className="flex items-center">
                <Clock size={14} className="mr-1" />
                {post.readTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 overflow-hidden">
                <Image 
                  src="https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png"
                  alt={post.author}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <span className="font-medium">{post.author}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }}></div>
              
              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Share and Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 size={16} />
                  Share
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Bookmark size={16} />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Author Bio */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
              <h2 className="text-xl font-bold mb-4">About the Author</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                  <Image 
                    src="https://realstatee.s3.eu-north-1.amazonaws.com/properties/1746474305856-Screenshot2025-04-29211732.png"
                    alt={post.author}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{post.author}</h3>
                  <p className="text-gray-600 mb-3">
                    {post.author} is a housing specialist with over 10 years of experience in the South African property market.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Follow</Button>
                    <Button variant="outline" size="sm">View All Articles</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="md:w-1/4">
            {/* Related Posts */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Related Articles</h3>
              <div className="space-y-4">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map(relatedPost => (
                    <Link href={`/blog/${relatedPost.id}`} key={relatedPost.id}>
                      <div className="group cursor-pointer">
                        <div className="relative h-32 mb-2 overflow-hidden rounded-lg">
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{relatedPost.date}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No related articles found.</p>
                )}
              </div>
            </div>
            
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Categories</h3>
              <div className="space-y-2">
                {["Student Housing", "Rental Tips", "Housing Trends", "Interior Design", "Legal", "Technology"].map((category, index) => (
                  <Link href={`/blog?category=${category}`} key={index}>
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-gray-700">{category}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {blogPosts.filter(p => p.category === category).length}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to Blog Button */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <Button 
          onClick={() => router.push('/blog')} 
          variant="outline" 
          className="flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to All Articles
        </Button>
      </div>
    </div>
  );
};

export default BlogPostDetail;
