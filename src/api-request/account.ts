import http from "@/lib/http";

export const AccountApiRequest = {
  getMe: async (accessToken: string) => {
    const response = await http.get<{ data: { email: string } }>(
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
