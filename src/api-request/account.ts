import http from "@/lib/http";
import type { ApiPaginatedResponse, ApiResponse } from "@/types/api";
import type { AdminAccount, CreateAccountModel } from "@/types/account";

export const AccountApiRequest = {
  getMe: async (accessToken: string) => {
    const response = await http.get<ApiResponse<{ email: string }>>(
      "/accounts/me",
      {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
        },
      }
    );
    return response;
  },

  getAccountsList: async (
    accessToken: string,
    params?: { page?: number; limit?: number; q?: string }
  ) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.q) qs.set("q", params.q);

    const url = qs.toString() ? `/accounts?${qs.toString()}` : "/accounts";

    const response = await http.get<ApiPaginatedResponse<AdminAccount>>(url, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
      },
      cache: "no-store",
    });
    return response;
  },

  createAccount: async (data: CreateAccountModel) => {
    const response = await http.post<ApiResponse<AdminAccount>>(
      "/accounts/create",
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
};
