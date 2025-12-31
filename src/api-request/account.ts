import http from "@/lib/http";
import type { ApiResponse } from "@/types/api";

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
};
