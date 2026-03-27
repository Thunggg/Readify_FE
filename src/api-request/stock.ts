import http from "@/lib/http";
import type { ApiResponse } from "@/types/api";

export type StockAlertLevel = "OUT_OF_STOCK" | "LOW_STOCK";

export interface StockAlertItem {
  stockId: string;
  quantity: number;
  location: string;
  status: string;
  level: StockAlertLevel;
  book: {
    id: string;
    title: string;
    isbn: string;
  };
  lastUpdated: string | null;
}

export interface StockAlertsData {
  threshold: number;
  total: number;
  outOfStockCount: number;
  lowStockCount: number;
  items: StockAlertItem[];
}

export interface UpdateStockPayload {
  quantity?: number;
  location?: string;
  price?: number;
  batch?: string;
  status?: string;
}

export const StockApiRequest = {
  getStockAlerts: async (lowStockThreshold = 5) => {
    const response = await http.get<ApiResponse<StockAlertsData>>("/stocks/alerts", {
      params: { lowStockThreshold },
      credentials: "include",
      cache: "no-store",
    });
    return response;
  },

  updateStock: async (stockId: string, payload: UpdateStockPayload) => {
    const response = await http.patch<ApiResponse<any>>(`/stocks/${stockId}`, payload, {
      credentials: "include",
    });
    return response;
  },
};
