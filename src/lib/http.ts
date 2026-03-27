import { authApiRequest } from "@/api-request/auth";
import envConfig from "@/configs/config-env";

type CustomOptions = RequestInit & {
  baseUrl?: string | undefined;
  params?: Record<string, any>;
};

const ENTITY_ERROR_STATUS = 422;

interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

type EntityErrorPayload = {
  message: string;
  errorCode: string;
  statusCode: number;
  details?: ErrorDetail[];
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [key: string]: any;
  };
  message: string;
  constructor(status: number, message: string, payload: any) {
    super(message);
    this.status = status;
    this.message = message;
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  status: number = ENTITY_ERROR_STATUS;
  payload: EntityErrorPayload;
  constructor({
    status,
    payload,
  }: {
    status: number;
    payload: EntityErrorPayload;
  }) {
    super(status, "Entity error", payload);
    this.payload = payload;
    this.status = status;
  }
}
let clientLogoutRequest: Promise<any> | null = null;
let clientRefreshRequest: Promise<{
  ok: boolean;
  accessToken?: string;
}> | null = null;

const request = async <Response>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options: CustomOptions | undefined,
) => {
  const isBrowser = typeof window !== "undefined";
  const body =
    options?.body instanceof FormData
      ? options.body
      : options?.body
        ? JSON.stringify(options.body)
        : undefined;
  const baseHeaders =
    options?.body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        };

  // nếu baseUrl không được cung cấp thì sử dụng NEXT_PUBLIC_API_ENDPOINT từ env
  // nếu baseUrl được cung cấp thì sử dụng baseUrl
  // nếu baseUrl là rỗng thì gọi đến next server
  const baseUrl =
    options?.baseUrl === undefined
      ? envConfig.NEXT_PUBLIC_API_ENDPOINT
      : options.baseUrl;

  let fullUrl = url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;

  // Xử lý params thành query string
  if (options?.params) {
    const queryParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Xử lý array: gửi dưới dạng nhiều query params (status=1&status=2)
        // Backend có thể nhận cả dạng này và comma-separated
        if (Array.isArray(value)) {
          value.forEach((item) => {
            queryParams.append(key, String(item));
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }

  const doFetch = async () => {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...baseHeaders,
        ...(options?.headers as Record<string, string>),
      } as HeadersInit,
      body,
      method,
      credentials: "include", // Include cookies for authentication
    });
    const payload: Response = await response.json();
    return { response, payload };
  };

  const { response, payload } = await doFetch();
  const data = { status: response.status, payload };

  if (!response.ok) {
    // lỗi liên quan đến dữ liệu
    if (response.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: number;
          payload: EntityErrorPayload;
        },
      );
    } else if (response.status === 401) {
      // Avoid infinite loop: don't attempt refresh on refresh endpoint itself
      const isRefreshCall =
        url === "/api/auth/refresh-token" ||
        url.endsWith("/auth/refresh-token");

      // CLIENT: try refresh-token once, then retry original request
      if (isBrowser && !isRefreshCall) {
        try {
          if (!clientRefreshRequest) {
            clientRefreshRequest = fetch("/api/auth/refresh-token", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }).then(async (r) => {
              if (!r.ok) return { ok: false as const };
              try {
                const data = await r.json();
                const accessToken =
                  data?.accessToken ||
                  data?.data?.accessToken ||
                  data?.payload?.data?.accessToken;

                // Optional: mimic login flow by also syncing via /api/auth
                if (typeof accessToken === "string" && accessToken.length > 0) {
                  await fetch("/api/auth", {
                    method: "POST",
                    body: JSON.stringify({ accessToken }),
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                  });
                }

                return { ok: true as const, accessToken };
              } catch {
                return { ok: true as const };
              }
            });
          }

          const refreshed = await clientRefreshRequest;
          clientRefreshRequest = null;

          if (refreshed.ok) {
            const retry = await doFetch();
            const retryData = {
              status: retry.response.status,
              payload: retry.payload,
            };
            if (!retry.response.ok) {
              // still unauthorized (or other error) after refresh
              throw new HttpError(
                retry.response.status,
                retry.response.statusText,
                retry.payload,
              );
            }
            return retryData;
          }
        } catch {
          clientRefreshRequest = null;
          // fall through to logout flow below
        }
      }

      // Nếu token hết hạn thì tự động logout
      // check ở server
      if (!clientLogoutRequest) {
        if (typeof window === "undefined") {
          clientLogoutRequest = fetch("/api/auth/logout", {
            method: "POST",
            body: JSON.stringify({ force: true }),
            headers: {
              ...baseHeaders,
              "Content-Type": "application/json",
            },
          });

          await clientLogoutRequest;
          return;
        } else {
          clientLogoutRequest = authApiRequest.logoutFromNextClientToServer();
          await clientLogoutRequest;
          location.href = "/login";
          return;
        }
      }
    } else {
      // lỗi server
      throw new HttpError(response.status, response.statusText, payload);
    }
  }

  return data;
};

const http = {
  get: <Response>(
    url: string,
    options?: Omit<CustomOptions, "body"> | undefined,
  ) => request<Response>("GET", url, options),

  post: <Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined,
  ) => request<Response>("POST", url, { ...options, body }),

  put: <Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined,
  ) => request<Response>("PUT", url, { ...options, body }),

  patch: <Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined,
  ) => request<Response>("PATCH", url, { ...options, body }),

  delete: <Response>(
    url: string,
    body?: any,
    options?: Omit<CustomOptions, "body"> | undefined,
  ) => request<Response>("DELETE", url, { ...options, body }),
};

export default http;
