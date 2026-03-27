import http from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type {
  OverviewStats,
  IncomeStatistics,
  CategoryStatistics,
  TopSellingBooks,
  RecentOrders,
  IncomeStatisticsParams,
  TopSellingParams,
  RecentOrdersParams,
} from "@/types/income";

export const IncomeApiRequest = {
  // Get overview statistics
  getOverview: async () => {
    const response = await http.get<ApiResponse<OverviewStats>>(
      "/income/overview",
      {
        credentials: "include",
        cache: "no-store",
      }
    );
    return response;
  },

  // Get income statistics grouped by period
  getStatistics: async (params?: IncomeStatisticsParams) => {
    const response = await http.get<ApiResponse<IncomeStatistics>>(
      "/income/statistics",
      {
        params,
        credentials: "include",
        cache: "no-store",
      }
    );
    return response;
  },

  // Get income by categories
  getCategoryStatistics: async (params?: IncomeStatisticsParams) => {
    const response = await http.get<ApiResponse<CategoryStatistics>>(
      "/income/categories",
      {
        params,
        credentials: "include",
        cache: "no-store",
      }
    );
    return response;
  },

  // Get top selling books
  getTopSellingBooks: async (params?: TopSellingParams) => {
    const response = await http.get<ApiResponse<TopSellingBooks>>(
      "/income/top-selling",
      {
        params,
        credentials: "include",
        cache: "no-store",
      }
    );
    return response;
  },

  // Get recent orders
  getRecentOrders: async (params?: RecentOrdersParams) => {
    const response = await http.get<ApiResponse<RecentOrders>>(
      "/income/recent-orders",
      {
        params,
        credentials: "include",
        cache: "no-store",
      }
    );
    return response;
  },

  // Get AI Insight Summary
  getAiSummary: async (params?: IncomeStatisticsParams) => {
    const response = await http.get<ApiResponse<any>>(
      "/income/ai-summary",
      {
        params,
        credentials: "include",
        cache: "no-store",
      }
    );
    return response;
  },
};
