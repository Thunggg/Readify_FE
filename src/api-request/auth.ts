import http from "@/lib/http";

export const authApiRequest = {
  login: async (email: string, password: string) => {
    const response = await http.post<{ data: { accessToken: string } }>(
      "/auth/login",
      { email, password },
      { credentials: "include" }
    );
    return response;
  },

  register: async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    const response = await http.post<{ data: { accessToken: string } }>(
      "/accounts/register",
      { email, password, confirmPassword },
      { headers: { "Content-Type": "application/json" } }
    );
    return response;
  },

  auth: async (accessToken: string) => {
    const response = await http.post<{
      data: { message: string; accessToken: string };
    }>(
      "/api/auth",
      { accessToken: accessToken },
      {
        headers: { "Content-Type": "application/json" },
        // call Next route handler on the same origin
        baseUrl: "",
      }
    );
    return response;
  },

  logoutFromNextServerToServer: async (accessToken: string) => {
    const response = await http.post<{
      data: { status: number; message: string };
    }>("/auth/logout", null, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
      },
    });
    return response;
  },

  logoutFromNextClientToServer: async () => {
    http.post("/api/auth/logout", null, {
      baseUrl: "",
    });
  },
};
