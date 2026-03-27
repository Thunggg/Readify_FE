import http from "@/lib/http";
import { ApiResponse } from "@/types/api";
import type {
  Promotion,
  PromotionLog,
  SearchPromotionDto,
  SearchPromotionLogDto,
  PaginatedResponse,
  CreatePromotionDto,
  UpdatePromotionDto,
} from "@/types/promotion";

export const PromotionApiRequest = {
  getPromotionList: async (query: SearchPromotionDto = {}) => {
    const params = new URLSearchParams();

    if (query.q) params.append("q", query.q);
    if (query.status) params.append("status", query.status);
    if (query.discountType) params.append("discountType", query.discountType);
    if (query.applyScope) params.append("applyScope", query.applyScope);
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.order) params.append("order", query.order);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());

    const queryString = params.toString();
    const url = `/promotions${queryString ? `?${queryString}` : ""}`;

    const response = await http.get<ApiResponse<PaginatedResponse<Promotion>>>(
      url,
      {
        credentials: "include",
        cache: "no-store",
      },
    );
    return response;
  },

  getPromotionById: async (id: string) => {
    const response = await http.get<ApiResponse<Promotion>>(
      `/promotions/${id}`,
      {
        credentials: "include",
      },
    );
    return response;
  },

  createPromotion: async (data: CreatePromotionDto) => {
    const response = await http.post<ApiResponse<Promotion>>(
      "/promotions",
      data,
      {
        credentials: "include",
      },
    );
    return response;
  },

  updatePromotion: async (id: string, data: UpdatePromotionDto) => {
    const response = await http.put<ApiResponse<Promotion>>(
      `/promotions/${id}`,
      data,
      {
        credentials: "include",
      },
    );
    return response;
  },

  deletePromotion: async (id: string) => {
    const response = await http.delete<ApiResponse<void>>(
      `/promotions/${id}`,
      undefined,
      {
        credentials: "include",
      },
    );
    return response;
  },

  // Promotion Logs
  getPromotionLogs: async (query: SearchPromotionLogDto = {}) => {
    const params = new URLSearchParams();

    if (query.search) params.append("search", query.search);
    if (query.promotionId) params.append("promotionId", query.promotionId);
    if (query.promotionCode)
      params.append("promotionCode", query.promotionCode);
    if (query.action) params.append("action", query.action);
    if (query.performedBy) params.append("performedBy", query.performedBy);
    if (query.fromDate) params.append("fromDate", query.fromDate);
    if (query.toDate) params.append("toDate", query.toDate);

    // Convert sortBy enum to actual MongoDB field names
    let sortBy = query.sortBy || "CREATED_AT";
    if (sortBy === "CREATED_AT") sortBy = "createdAt";
    else if (sortBy === "PROMOTION_CODE") sortBy = "promotionCode";
    else if (sortBy === "ACTION") sortBy = "action";

    if (sortBy) params.append("sortBy", sortBy);
    if (query.order) params.append("order", query.order);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());

    const queryString = params.toString();
    const url = `/promotion-logs${queryString ? `?${queryString}` : ""}`;

    const response = await http.get<
      ApiResponse<PaginatedResponse<PromotionLog>>
    >(url, {
      credentials: "include",
      cache: "no-store",
    });
    return response;
  },

  getPromotionLogById: async (id: string) => {
    const response = await http.get<ApiResponse<PromotionLog>>(
      `/promotion-logs/${id}`,
      {
        credentials: "include",
      },
    );
    return response;
  },
};
