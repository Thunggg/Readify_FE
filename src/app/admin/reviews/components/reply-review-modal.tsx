"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReviewApiRequest } from "@/api-request/review";
import { handleErrorApi } from "@/lib/utils";
import type { Review } from "@/types/review";
import { Loader2Icon, MessageSquareIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

interface ReplyReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
  onSuccess: (updatedReview: Review) => void;
}

export default function ReplyReviewModal({
  open,
  onOpenChange,
  review,
  onSuccess,
}: ReplyReviewModalProps) {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (review?.adminReply) {
      setReply(review.adminReply);
    } else {
      setReply("");
    }
  }, [review]);

  const handleSubmit = async () => {
    if (!review || !reply.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await ReviewApiRequest.adminReplyReview(review._id, {
        adminReply: reply.trim(),
      });

      if (response?.payload?.success && response.payload.data) {
        toast.success("Reply saved successfully");
        onSuccess(response.payload.data);
      }
    } catch (error) {
      handleErrorApi({ error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!review) return;

    setIsDeleting(true);
    try {
      const response = await ReviewApiRequest.deleteAdminReply(review._id);

      if (response?.payload?.success) {
        toast.success("Reply deleted successfully");
        onSuccess({
          ...review,
          adminReply: undefined,
          adminReplyAt: undefined,
          adminReplyBy: undefined,
        });
      }
    } catch (error) {
      handleErrorApi({ error });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareIcon className="size-5" />
            {review?.adminReply ? "Edit Reply" : "Reply to Review"}
          </DialogTitle>
          <DialogDescription>
            Write a reply to the customer&apos;s review. This will be visible to
            all users viewing the review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Review Summary */}
          {review && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {review.userId?.firstName
                    ? `${review.userId.firstName} ${review.userId.lastName}`
                    : review.userId?.email}
                </span>
                <span className="text-sm text-muted-foreground">
                  {review.rating}/5 stars
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {review.comment || "No comment"}
              </p>
            </div>
          )}

          {/* Reply Input */}
          <div className="space-y-2">
            <Label htmlFor="reply">Your Reply</Label>
            <Textarea
              id="reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write your reply here..."
              rows={5}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reply.length}/2000 characters
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {review?.adminReply && (
            <Button
              variant="destructive"
              onClick={handleDeleteReply}
              disabled={isDeleting || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <Loader2Icon className="size-4 mr-2 animate-spin" />
              ) : (
                <TrashIcon className="size-4 mr-2" />
              )}
              Delete Reply
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isDeleting}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reply.trim() || isSubmitting || isDeleting}
              className="flex-1 sm:flex-initial"
            >
              {isSubmitting ? (
                <Loader2Icon className="size-4 mr-2 animate-spin" />
              ) : (
                <MessageSquareIcon className="size-4 mr-2" />
              )}
              {review?.adminReply ? "Update Reply" : "Send Reply"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
