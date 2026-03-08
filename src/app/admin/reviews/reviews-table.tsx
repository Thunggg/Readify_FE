"use client";

import { ReviewApiRequest } from "@/api-request/review";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { handleErrorApi } from "@/lib/utils";
import type { Review, ReviewStatus } from "@/types/review";
import dayjs from "dayjs";
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  StarIcon,
  TrashIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReviewsToolbar, { FilterState } from "./components/reviews-toolbar";
import DetailReviewDrawer from "./components/detail-review-drawer";
import ReplyReviewModal from "./components/reply-review-modal";
import DeleteReviewModal from "./components/delete-review-modal";
import PaginationControls from "./components/pagination-controls";

export type SortField = "createdAt" | "rating" | "helpfulCount" | null;
export type SortOrder = "asc" | "desc" | null;

export default function ReviewsTable() {
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    rating: [],
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

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
            className={`size-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const onSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const statusValue =
          filters.status.length > 0 ? filters.status[0] : undefined;
        const ratingValue =
          filters.rating.length > 0 ? parseInt(filters.rating[0]) : undefined;

        const response = await ReviewApiRequest.getAdminReviewsList({
          page,
          limit,
          status: statusValue as ReviewStatus | undefined,
          rating: ratingValue,
          sortBy: sortField ?? "createdAt",
          order: sortOrder ?? "desc",
        });

        if (response?.payload?.success && response.payload.data) {
          setLocalReviews(response.payload.data.items || []);
          setTotal(response.payload.data.meta?.total || 0);
        }
      } catch (error) {
        handleErrorApi({ error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [sortField, sortOrder, filters, page, limit]);

  const handleViewDetail = (review: Review) => {
    setSelectedReview(review);
    setShowDetailDrawer(true);
  };

  const handleReply = (review: Review) => {
    setSelectedReview(review);
    setShowReplyModal(true);
  };

  const handleDelete = (review: Review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const handleStatusChange = async (
    reviewId: string,
    newStatus: ReviewStatus,
  ) => {
    try {
      const response = await ReviewApiRequest.updateReviewStatus(reviewId, {
        status: newStatus,
      });
      if (response?.payload?.success) {
        setLocalReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId ? { ...r, status: newStatus } : r,
          ),
        );
      }
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleReplySuccess = (updatedReview: Review) => {
    setLocalReviews((prev) =>
      prev.map((r) => (r._id === updatedReview._id ? updatedReview : r)),
    );
    setShowReplyModal(false);
  };

  const handleDeleteSuccess = (reviewId: string) => {
    setLocalReviews((prev) => prev.filter((r) => r._id !== reviewId));
    setShowDeleteModal(false);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <ReviewsToolbar
        filters={filters}
        onFiltersChange={setFilters}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />

      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {isLoading ? "Loading reviews..." : `Total ${total} reviews`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Reviewer</TableHead>
              <TableHead className="w-[250px]">Book</TableHead>
              <TableHead className="w-[120px]">Rating</TableHead>
              <TableHead className="w-[300px]">Comment</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px]">Reply</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  No reviews found
                </TableCell>
              </TableRow>
            ) : (
              localReviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {review.userId?.firstName?.[0] ||
                            review.userId?.email?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {review.userId?.firstName && review.userId?.lastName
                            ? `${review.userId.firstName} ${review.userId.lastName}`
                            : review.userId?.email || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {review.userId?.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {(() => {
                        let url = (review.bookId?.thumbnailUrl || "").trim();
                        // Loại bỏ mọi dấu ngoặc kép, ký tự trắng đầu/cuối, và các ký tự không hợp lệ
                        url = url.replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "").trim();
                        let isValid = false;
                        try {
                          // Kiểm tra URL hợp lệ tuyệt đối
                          if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
                            // Dùng URL constructor để kiểm tra hợp lệ
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
                              width={40}
                              height={56}
                              className="w-10 h-14 object-cover rounded"
                            />
                          );
                        }
                        return (
                          <div className="w-10 h-14 bg-muted rounded flex items-center justify-center text-xs">
                            N/A
                          </div>
                        );
                      })()}
                      <span className="font-medium text-sm line-clamp-2">
                        {review.bookId?.title || "Unknown Book"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{ratingStars(review.rating)}</TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2">
                      {review.comment || (
                        <span className="text-muted-foreground italic">
                          No comment
                        </span>
                      )}
                    </p>
                    {review.adminReply && (
                      <ReplyBox reply={review.adminReply} />
                    )}
                  </TableCell>
                  <TableCell>{statusLabel(review.status)}</TableCell>
                  <TableCell>
                    {review.adminReply ? (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        <MessageSquareIcon className="size-3 mr-1" />
                        Replied
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        No reply
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {dayjs(review.createdAt).format("DD/MM/YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => handleViewDetail(review)}
                          >
                            <EyeIcon className="size-4 mr-2" />
                            View Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReply(review)}>
                            <MessageSquareIcon className="size-4 mr-2" />
                            {review.adminReply ? "Edit Reply" : "Reply"}
                          </DropdownMenuItem>
                          {review.status === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(review._id, "APPROVED")
                                }
                              >
                                <CheckCircleIcon className="size-4 mr-2 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(review._id, "REJECTED")
                                }
                              >
                                <XCircleIcon className="size-4 mr-2 text-red-600" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(review)}
                            className="text-red-600"
                          >
                            <TrashIcon className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Detail Drawer */}
      <DetailReviewDrawer
        open={showDetailDrawer}
        onOpenChange={setShowDetailDrawer}
        review={selectedReview}
        onReply={() => {
          setShowDetailDrawer(false);
          setShowReplyModal(true);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Reply Modal */}
      <ReplyReviewModal
        open={showReplyModal}
        onOpenChange={setShowReplyModal}
        review={selectedReview}
        onSuccess={handleReplySuccess}
      />

      {/* Delete Modal */}
      <DeleteReviewModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        review={selectedReview}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

function ReplyBox({ reply }: { reply: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        className="flex items-center gap-2 text-primary font-semibold text-xs hover:underline focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <MessageSquareIcon className="size-4" />
        Admin reply
        {open ? (
          <ChevronUpIcon className="size-4" />
        ) : (
          <ChevronDownIcon className="size-4" />
        )}
      </button>
      {open && (
        <div className="mt-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary shadow-sm animate-fade-in">
          {reply}
        </div>
      )}
    </div>
  );
}
