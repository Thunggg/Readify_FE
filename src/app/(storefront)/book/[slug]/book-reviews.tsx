"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, ThumbsUp, MessageSquare, User, Calendar, Edit, Trash2, PlusCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ReviewApiRequest } from "@/api-request/review";
import { useCurrentUser } from "@/contexts/user-context";
import { toast } from "sonner";
import type { BookRatingSummary, Review } from "@/types/review";
import dayjs from "dayjs";
import { ReviewForm } from "./review-form";

interface BookReviewsProps {
  bookId: string;
  /** Called after reviews change so the book header can refresh rating from the same summary API */
  onRatingSummaryUpdated?: () => void | Promise<void>;
}

export function BookReviews({ bookId, onRatingSummaryUpdated }: BookReviewsProps) {
  const { currentUser } = useCurrentUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<BookRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const fetchData = useCallback(async () => {
    if (!bookId) return;
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        ReviewApiRequest.getBookReviews(bookId, 1, 100), // Increase limit to fetch more for display
        ReviewApiRequest.getBookRatingSummary(bookId),
      ]);

      if (reviewsRes?.payload?.success) {
        setReviews(reviewsRes.payload.data.items || []);
      }

      if (summaryRes?.payload?.success && summaryRes.payload.data) {
        setSummary(summaryRes.payload.data);
      }
    } catch (err) {
      console.error("Fetch reviews failed", err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReviewSuccess = async () => {
    setShowReviewForm(false);
    setEditingReview(null);
    await fetchData();
    await Promise.resolve(onRatingSummaryUpdated?.());
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await ReviewApiRequest.deleteReview(reviewId);
      if (res?.payload?.success) {
        toast.success("Review deleted successfully");
        await fetchData();
        await Promise.resolve(onRatingSummaryUpdated?.());
      }
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const res = await ReviewApiRequest.markHelpful(reviewId);
      if (res?.payload?.success) {
        setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r));
        toast.success("Marked as helpful");
      }
    } catch (err: any) {
      if (err.payload?.message) {
        toast.error(err.payload.message);
      } else {
        toast.error("Failed to mark as helpful");
      }
    }
  };

  const userHasReview = reviews.some(r => r.userId?._id === currentUser?._id);

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="space-y-12">
      {/* Header & Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-bold text-primary">{summary?.ratingAvg?.toFixed(1) || "0.0"}</span>
            </div>
          </div>
          
          {currentUser ? (
              !userHasReview && !showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)} className="rounded-xl shadow-lg border-b-4 border-primary-foreground/30 active:border-b-0 translate-y-0 active:translate-y-1 transition-all">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Write a review
                </Button>
              )
          ) : (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-muted/50 text-xs text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Please login to review this book.
            </div>
          )}
      </div>

      {/* Review Form (Add or Edit) */}
      {(showReviewForm || editingReview) && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
             <ReviewForm 
                bookId={bookId} 
                existingReview={editingReview}
                onSuccess={handleReviewSuccess}
                onCancel={() => { setShowReviewForm(false); setEditingReview(null); }}
             />
          </div>
      )}

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Summary Column */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border border-muted-foreground/10 bg-card/60 backdrop-blur-sm p-8 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Rating details</h3>
            <div className="flex items-center gap-5 mb-8">
              <div className="text-6xl font-black text-primary drop-shadow-sm">
                {summary?.ratingAvg?.toFixed(1) || "0.0"}
              </div>
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${
                        s <= Math.floor(summary?.ratingAvg || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted dark:text-muted/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Based on {(summary?.ratingCount || 0).toLocaleString()} reviews
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = summary?.ratingDistribution?.[rating] || 0;
                const percent = summary?.ratingCount
                  ? (count / summary.ratingCount) * 100
                  : 0;
                return (
                  <div key={rating} className="flex items-center gap-3 group">
                    <span className="flex items-center gap-1.5 text-sm font-bold w-10 text-muted-foreground transition-colors group-hover:text-foreground">
                      {rating} <Star className="h-3.5 w-3.5 fill-current" />
                    </span>
                    <Progress value={percent} className="h-2.5 flex-1 bg-muted/50" />
                    <span className="text-xs text-muted-foreground font-semibold w-12 text-right">
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-10">
          {reviews.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl bg-muted/20 border-muted opacity-60">
                <MessageSquare className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h4 className="text-xl font-bold text-muted-foreground">No reviews yet</h4>
                <p className="max-w-xs text-muted-foreground text-sm mt-2 font-medium italic">Be the heartbeat of this book. Tell the world what you think!</p>
             </div>
          ) : (
            reviews.map((review, index) => (
              <div key={review._id} className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/5 shadow-inner">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {review.userId?.firstName?.[0] || review.userId?.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-base leading-none mb-1.5 flex items-center gap-2">
                        {review.userId?._id === currentUser?._id ? (
                           <>
                             <span className="text-primary">Me</span>
                             <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                           </>
                        ) : null}
                        {review.userId?.firstName && review.userId?.lastName 
                          ? `${review.userId.firstName} ${review.userId.lastName}` 
                          : (review.userId?.email?.split('@')[0] || "Anonymous")}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {dayjs(review.createdAt).format("MMMM D, YYYY")}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex shadow-sm bg-muted/40 p-1 rounded-lg">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= review.rating
                              ? "fill-yellow-400 text-yellow-400 font-bold"
                              : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Actions for owner */}
                    {review.userId?._id === currentUser?._id && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setEditingReview(review)} className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                            <Edit className="h-3.5 w-3.5" />
                         </button>
                         <button onClick={() => handleDeleteReview(review._id)} className="p-1.5 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                         </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pl-16">
                  <p className="text-base leading-relaxed text-foreground/80 mb-6 whitespace-pre-wrap font-medium">
                    {review.comment || <span className="italic text-muted-foreground">Rating only, no description.</span>}
                  </p>

                  {review.adminReply && (
                    <div className="mt-6 relative rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 shadow-sm ring-1 ring-white/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-primary block">Readify Support Team</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                <Calendar className="h-2.5 w-2.5" />
                                {dayjs(review.adminReplyAt).format("MMM DD, YYYY")}
                            </span>
                        </div>
                      </div>
                      <p className="text-sm italic text-foreground/80 leading-relaxed pl-5 border-l-4 border-primary/20">
                        &quot;{review.adminReply}&quot;
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-6">
                    <button 
                      onClick={() => handleMarkHelpful(review._id)}
                      className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-all active:scale-95 px-3 py-1.5 rounded-full border border-transparent hover:border-primary/20 hover:bg-primary/5"
                    >
                      <ThumbsUp className={`h-4 w-4 ${review.helpfulCount ? "fill-primary/20 text-primary" : ""}`} />
                      Helpful ({review.helpfulCount || 0})
                    </button>
                  </div>
                </div>
                {index !== reviews.length - 1 && <Separator className="mt-10 opacity-50" />}
              </div>
            ))
          )}

          {/* Load More Button - Logic could be expanded for true pagination */}
          {reviews.length > 5 && (
              <Button variant="ghost" className="w-full text-muted-foreground font-bold hover:bg-muted text-xs tracking-widest uppercase">
                End of reviews
              </Button>
          )}
        </div>
      </div>
    </div>
  );
}
