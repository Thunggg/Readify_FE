"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Review, ReviewStatus } from "@/types/review";
import dayjs from "dayjs";
import Image from "next/image";
import {
  CheckCircleIcon,
  ClockIcon,
  MessageSquareIcon,
  StarIcon,
  XCircleIcon,
} from "lucide-react";

interface DetailReviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
  onReply: () => void;
  onStatusChange: (reviewId: string, status: ReviewStatus) => void;
}

export default function DetailReviewDrawer({
  open,
  onOpenChange,
  review,
  onReply,
  onStatusChange,
}: DetailReviewDrawerProps) {
  if (!review) return null;

  const statusLabel = (status: ReviewStatus) => {
    if (status === "APPROVED") {
      return (
        <Badge className="border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400">
          <CheckCircleIcon className="size-3 mr-1" />
          Approved
        </Badge>
      );
    }
    if (status === "PENDING") {
      return (
        <Badge className="border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
          <ClockIcon className="size-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (status === "REJECTED") {
      return (
        <Badge className="border-none bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400">
          <XCircleIcon className="size-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    return null;
  };

  const ratingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`size-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Review Details</SheetTitle>
          <SheetDescription>View complete review information</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Reviewer Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Reviewer
            </h4>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {review.userId?.firstName?.[0] ||
                    review.userId?.email?.[0]?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {review.userId?.firstName && review.userId?.lastName
                    ? `${review.userId.firstName} ${review.userId.lastName}`
                    : "Unknown User"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {review.userId?.email}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Book Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Book</h4>
            <div className="flex items-start gap-3">
              {(() => {
                let url = (review.bookId?.thumbnailUrl || "").trim();
                // Loại bỏ mọi dấu ngoặc kép, ký tự trắng đầu/cuối
                url = url
                  .replace(/^"+|"+$/g, "")
                  .replace(/^'+|'+$/g, "")
                  .trim();
                let isValid = false;
                try {
                  // Kiểm tra URL hợp lệ tuyệt đối
                  if (
                    url &&
                    (url.startsWith("http://") || url.startsWith("https://"))
                  ) {
                    new URL(url);
                    isValid = true;
                  }
                } catch (e) {
                  isValid = false;
                }
                if (isValid) {
                  return (
                    <Image
                      src={url}
                      alt={review.bookId.title}
                      width={64}
                      height={96}
                      className="w-16 h-24 object-cover rounded"
                    />
                  );
                }
                return (
                  <div className="w-16 h-24 bg-muted rounded flex items-center justify-center text-xs">
                    No Image
                  </div>
                );
              })()}
              <div>
                <p className="font-medium">{review.bookId?.title}</p>
                {review.bookId?.slug && (
                  <p className="text-sm text-muted-foreground">
                    /{review.bookId.slug}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Review Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                Rating
              </h4>
              {ratingStars(review.rating)}
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Status
              </h4>
              <div className="flex items-center gap-2">
                {statusLabel(review.status)}
                {review.status === "PENDING" && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => onStatusChange(review._id, "APPROVED")}
                    >
                      <CheckCircleIcon className="size-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => onStatusChange(review._id, "REJECTED")}
                    >
                      <XCircleIcon className="size-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Comment
              </h4>
              <p className="text-sm bg-muted/50 rounded-lg p-3">
                {review.comment || (
                  <span className="text-muted-foreground italic">
                    No comment provided
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Helpful: {review.helpfulCount} votes</span>
              <span>{dayjs(review.createdAt).format("DD/MM/YYYY HH:mm")}</span>
            </div>
          </div>

          <Separator />

          {/* Admin Reply Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                Admin Reply
              </h4>
              <Button size="sm" variant="outline" onClick={onReply}>
                <MessageSquareIcon className="size-4 mr-2" />
                {review.adminReply ? "Edit Reply" : "Add Reply"}
              </Button>
            </div>

            {review.adminReply ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                <p className="text-sm">{review.adminReply}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    By:{" "}
                    {review.adminReplyBy?.firstName
                      ? `${review.adminReplyBy.firstName} ${review.adminReplyBy.lastName}`
                      : review.adminReplyBy?.email}
                  </span>
                  <span>
                    {review.adminReplyAt &&
                      dayjs(review.adminReplyAt).format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No admin reply yet
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
