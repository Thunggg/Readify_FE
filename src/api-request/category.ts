import http from "@/lib/http";
import type { ApiResponse } from "@/types/api";

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  sortOrder: number;
  status: number;
};

export type ListCategoriesParams = {
  page?: number;
  limit?: number;
  status?: number;
};

export const CategoryApiRequest = {
  getCategories(params?: ListCategoriesParams, accessToken?: string) {
    return http.get<ApiResponse<Category[]>>("/categories", {
      params,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
      },
    });
  },

  getCategoryById(id: string, accessToken?: string) {
    return http.get<ApiResponse<Category>>(`/categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
      },
    });
  },
};
