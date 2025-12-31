import http from "@/lib/http";
import type { ApiResponse } from "@/types/api";

export type RegisterAccountPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  sex: number;
  email: string;
  password: string;
  confirmPassword: string;
};

export type VerifyRegisterPayload = {
  otp: string;
};

// Returned after successful OTP verification (based on your backend `account` object)
export type VerifiedAccount = {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dateOfBirth: string | Date;
  email: string;
  status: number;
  role: number;
  sex: number;
};

export const authApiRequest = {
  login: async (email: string, password: string) => {
    const response = await http.post<ApiResponse<{ accessToken: string }>>(
      "/auth/login",
      { email, password },
      { credentials: "include" }
    );
    return response;
  },

  register: async (payload: RegisterAccountPayload) => {
    // Backend: returns ApiResponse.success(null, 'OTP sent...', 200)
    const response = await http.post<ApiResponse<null>>(
      "/accounts/register",
      payload,
      { credentials: "include" }
    );
    return response;
  },

  resendRegisterOtp: async () => {
    // Backend reads regEmail from cookie
    const response = await http.post<ApiResponse<null>>(
      "/accounts/register/resend-otp",
      {},
      { credentials: "include" }
    );
    return response;
  },

  verifyRegisterOtp: async (payload: VerifyRegisterPayload) => {
    // Backend reads regEmail from cookie + clears it on success
    const response = await http.post<ApiResponse<VerifiedAccount>>(
      "/accounts/register/verify",
      payload,
      { credentials: "include" }
    );
    return response;
  },

  auth: async (accessToken: string) => {
    const response = await http.post<
      ApiResponse<{ message: string; accessToken: string }>
    >(
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
