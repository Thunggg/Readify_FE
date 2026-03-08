import http from "@/lib/http";
import type { ApiPaginatedResponse, ApiResponse } from "@/types/api";
import type {
  Review,
  AdminReviewListParams,
  AdminReplyRequest,
  UpdateReviewStatusRequest,
} from "@/types/review";

export const ReviewApiRequest = {
  // Admin - Get all reviews
  getAdminReviewsList: async (params?: AdminReviewListParams) => {
    const response = await http.get<ApiPaginatedResponse<Review>>(
      "/reviews/admin/all",
      {
        params,
        credentials: "include",
        cache: "no-store",
      }
    );
    return response;
  },

  // Admin - Get review detail
  getAdminReviewDetail: async (id: string) => {
    const response = await http.get<ApiResponse<Review>>(
      `/reviews/admin/${id}`,
      {
        credentials: "include",
        cache: "no-store",
      }
    );
    return response;
  },

  // Admin - Reply to review
  adminReplyReview: async (id: string, data: AdminReplyRequest) => {
    const response = await http.patch<ApiResponse<Review>>(
      `/reviews/admin/${id}/reply`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    return response;
  },

  // Admin - Delete reply
  deleteAdminReply: async (id: string) => {
    const response = await http.delete<ApiResponse<{ _id: string }>>(
      `/reviews/admin/${id}/reply`,
      {
        credentials: "include",
      }
    );
    return response;
  },

  // Admin - Update review status
  updateReviewStatus: async (id: string, data: UpdateReviewStatusRequest) => {
    const response = await http.patch<ApiResponse<Review>>(
      `/reviews/admin/${id}/status`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    return response;
  },

  // Admin - Delete review
  deleteReview: async (id: string) => {
    const response = await http.delete<ApiResponse<{ _id: string }>>(
      `/reviews/${id}`,
      {
        credentials: "include",
      }
    );
    return response;
  },
};
