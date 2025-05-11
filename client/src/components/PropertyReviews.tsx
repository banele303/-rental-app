"use client";

import { useState, useEffect } from "react";
import { Star, StarHalf, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewForm from "./ReviewForm";
import { toast } from "sonner";

interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

interface PropertyReviewsProps {
  propertyId: number;
}

const PropertyReviews = ({ propertyId }: PropertyReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      // This would be replaced with an actual API call
      // For now, we'll use mock data
      const mockReviews = [
        {
          id: 1,
          rating: 4.5,
          comment: "Great location, close to campus and very quiet neighborhood. The landlord was responsive to maintenance requests.",
          userName: "Sarah Johnson",
          createdAt: "2025-04-15T10:30:00Z"
        },
        {
          id: 2,
          rating: 5,
          comment: "Absolutely loved staying here during my studies. Modern amenities and spacious rooms. Highly recommend!",
          userName: "Michael Chen",
          createdAt: "2025-03-22T14:45:00Z"
        },
        {
          id: 3,
          rating: 3.5,
          comment: "Decent place for the price. Some issues with hot water but overall acceptable for student housing.",
          userName: "Emma Williams",
          createdAt: "2025-02-10T09:15:00Z"
        }
      ];
      
      setReviews(mockReviews);
      
      // Calculate average rating
      const total = mockReviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(total / mockReviews.length);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="mt-8 mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Student Reviews
        </h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {renderStars(averageRating)}
          </div>
          <span className="text-lg font-medium text-gray-800">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>

      {!showReviewForm && (
        <Button 
          onClick={() => setShowReviewForm(true)}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Write a Review
        </Button>
      )}

      {showReviewForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <ReviewForm 
            propertyId={propertyId} 
            onReviewSubmitted={handleReviewSubmitted} 
          />
          <Button 
            variant="outline" 
            onClick={() => setShowReviewForm(false)}
            className="mt-2"
          >
            Cancel
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. Be the first to review this property!
            </p>
          ) : (
            reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{review.userName}</h4>
                      <div className="flex items-center mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(review.createdAt)}
                  </div>
                </div>
                <p className="mt-4 text-gray-700">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyReviews;
