// Review Types

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface ReviewBook {
  _id: string;
  title: string;
  slug?: string;
  thumbnailUrl?: string;
}

export interface Review {
  _id: string;
  userId: ReviewUser;
  bookId: ReviewBook;
  orderId?: string;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  helpfulCount: number;
  adminReply?: string;
  adminReplyAt?: string;
  adminReplyBy?: ReviewUser;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReviewListParams {
  page?: number;
  limit?: number;
  bookId?: string;
  userId?: string;
  rating?: number;
  status?: ReviewStatus;
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
  order?: 'asc' | 'desc';
}

export interface AdminReplyRequest {
  adminReply: string;
}

export interface UpdateReviewStatusRequest {
  status: ReviewStatus;
}
