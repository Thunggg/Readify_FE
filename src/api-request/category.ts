import http from "@/lib/http";
import type { ApiResponse } from "@/types/api";

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: string | null;
  sortOrder: number;
  status: number;
  bookCount?: number;
};

export type ListCategoriesParams = {
  page?: number;
  limit?: number;
  status?: number;
  q?: string;
  parentId?: string | null;
};

export type PaginatedCategoryResponse = {
  items: Category[];
  total: number;
  page: number;
  limit: number;
};

export const CategoryApiRequest = {
  getCategories: (params?: ListCategoriesParams) =>
    http.get<ApiResponse<PaginatedCategoryResponse>>("/categories", { params }),

  getCategoryById: (id: string) =>
    http.get<ApiResponse<Category>>(`/categories/${id}`),

  createCategory: (data: Partial<Category>) =>
    http.post<ApiResponse<Category>>("/categories", data),

  updateCategory: (id: string, data: Partial<Category>) =>
    http.patch<ApiResponse<Category>>(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    http.delete<ApiResponse<null>>(`/categories/${id}`),

  getCategoryPath: (id: string) =>
    http.get<ApiResponse<Category[]>>(`/categories/${id}/path`),
};
