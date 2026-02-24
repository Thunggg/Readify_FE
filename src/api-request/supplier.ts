import http from "@/lib/http";
import type { ApiPaginatedResponse } from "@/types/api";

export type Supplier = {
  _id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type SearchSuppliersParams = {
  q?: string;
  page?: number;
  limit?: number;
  isDeleted?: boolean;
};

const withCookie = (accessToken?: string) => ({
  "Content-Type": "application/json",
  ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
});

export const SupplierApiRequest = {
  getSuppliers(params?: SearchSuppliersParams, accessToken?: string) {
    return http.get<ApiPaginatedResponse<Supplier>>("/suppliers", {
      params,
      headers: withCookie(accessToken),
    });
  },
};
