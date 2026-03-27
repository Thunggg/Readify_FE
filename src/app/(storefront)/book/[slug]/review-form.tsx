"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReviewApiRequest } from "@/api-request/review";
import { toast } from "sonner";
import type { Review } from "@/types/review";

interface ReviewFormProps {
  bookId: string;
  existingReview?: Review | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ bookId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        // Update existing review
        const res = await ReviewApiRequest.updateReview(existingReview._id, {
          rating,
          comment: comment.trim(),
        });
        if (res?.payload?.success) {
          toast.success("Review updated successfully");
          onSuccess();
        }
      } else {
        // Create new review
        const res = await ReviewApiRequest.createReview({
          bookId,
          rating,
          comment: comment.trim(),
        });
        if (res?.payload?.success) {
          toast.success("Review submitted successfully! It will be visible once approved.");
          onSuccess();
        }
      }
    } catch (err: any) {
      console.error("Submit review failed", err);
      // Backend might return validation error
      if (err.payload?.message) {
        toast.error(err.payload.message);
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-muted/30 p-6 shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-semibold flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Your Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              className="transition-transform active:scale-90"
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(s)}
            >
              <Star
                className={`h-8 w-8 ${
                  s <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Your Comment
        </label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts about this book..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          className="bg-background border-muted-foreground/20 focus-visible:ring-primary/30"
        />
        <div className="text-right text-[10px] text-muted-foreground">
            {comment.length}/2000 characters
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={isSubmitting || rating === 0} 
          className="flex-1 rounded-lg h-11"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            existingReview ? "Update Review" : "Submit Review"
          )}
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg h-11"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
