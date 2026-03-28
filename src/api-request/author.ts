import http from "@/lib/http";
import type { ApiPaginatedResponse } from "@/types/api";

export type Author = {
  _id: string;
  name: string;
  slug: string;
  penName?: string;
  avatar?: string;
  status?: string;
};

export type SearchAuthorsParams = {
  q?: string;
  page?: number;
  limit?: number;
};

const withCookie = (accessToken?: string) => ({
  "Content-Type": "application/json",
  ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
});

export const AuthorApiRequest = {
  getAuthors(params?: SearchAuthorsParams, accessToken?: string) {
    return http.get<ApiPaginatedResponse<Author>>("/admin/authors", {
      params,
      headers: withCookie(accessToken),
    });
  },
};
