"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReviewApiRequest } from "@/api-request/review";
import { handleErrorApi } from "@/lib/utils";
import type { Review } from "@/types/review";
import { Loader2Icon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

interface DeleteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
  onSuccess: (reviewId: string) => void;
}

export default function DeleteReviewModal({
  open,
  onOpenChange,
  review,
  onSuccess,
}: DeleteReviewModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!review) return;

    setIsDeleting(true);
    try {
      const response = await ReviewApiRequest.deleteReview(review._id);

      if (response?.payload?.success) {
        toast.success("Review deleted successfully");
        onSuccess(review._id);
      }
    } catch (error) {
      handleErrorApi({ error });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Review</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this review? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {review && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 my-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {review.userId?.firstName
                  ? `${review.userId.firstName} ${review.userId.lastName}`
                  : review.userId?.email || "Unknown User"}
              </span>
              <span className="text-sm text-muted-foreground">
                {review.rating}/5 stars
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Book: {review.bookId?.title || "Unknown"}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {review.comment || "No comment"}
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2Icon className="size-4 mr-2 animate-spin" />
            ) : (
              <TrashIcon className="size-4 mr-2" />
            )}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
