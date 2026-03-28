import http from "@/lib/http";
import type { ApiResponse, ApiPaginatedResponse } from "@/types/api";
import type {
  PublicBook,
  PublicBookDetail,
  SearchPublicBooksParams,
  BookSuggestion,
  SearchBookSuggestion,
  AdminTrendingBooksResponse,
  AdminBook,
  SearchAdminBooksParams,
  CreateBookRequest,
  UpdateBookRequest,
} from "@/types/book";

const BASE_PUBLIC = "/book";
const BASE_ADMIN = "/admin/book";

const withCookie = (accessToken?: string) => ({
  "Content-Type": "application/json",
  ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
});
const safe = (v?: string | null) => (typeof v === "string" ? v.trim() : "");

export const BookApiRequest = {
  // PUBLIC (guest + logged-in)

  getBooks(params?: SearchPublicBooksParams, accessToken?: string) {
    return http.get<ApiPaginatedResponse<PublicBook>>(BASE_PUBLIC, {
      params,
      headers: withCookie(accessToken),
    });
  },

  /** Get book detail by slug */
  getBySlug: (slug: string, accessToken?: string) => {
    const s = safe(slug);
    return http.get<{ data: PublicBookDetail }>(`/book/slug/${s}`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
      },
    });
  },

  /** Get book detail by id */
  getById(bookId: string, accessToken?: string) {
    return http.get<ApiResponse<PublicBookDetail>>(
      `${BASE_PUBLIC}/${safe(bookId)}`,
      {
        headers: withCookie(accessToken),
      }
    );
  },

  /** Related books by slug */
  getRelatedBySlug(slug: string, limit?: number, accessToken?: string) {
    return http.get<ApiResponse<PublicBook[]>>(
      `${BASE_PUBLIC}/slug/${safe(slug)}/related`,
      {
        params: limit ? { limit } : undefined,
        headers: withCookie(accessToken),
      }
    );
  },

  /** Related books by id */
  getRelatedById(bookId: string, limit?: number, accessToken?: string) {
    return http.get<ApiResponse<PublicBook[]>>(
      `${BASE_PUBLIC}/${safe(bookId)}/related`,
      {
        params: limit ? { limit } : undefined,
        headers: withCookie(accessToken),
      }
    );
  },

  /** Search suggestions (autocomplete) */
  getSuggestions(params?: SearchBookSuggestion, accessToken?: string) {
    return http.get<ApiResponse<BookSuggestion[]>>(
      `${BASE_PUBLIC}/suggestions`,
      {
        params,
        headers: withCookie(accessToken),
      }
    );
  },

  // =================== ADMIN ===================

  adminGetBooks(accessToken: string, params?: SearchAdminBooksParams) {
    return http.get<ApiPaginatedResponse<AdminBook>>(BASE_ADMIN, {
      params,
      headers: withCookie(accessToken),
    });
  },

  adminGetById(accessToken: string, bookId: string) {
    return http.get<ApiResponse<AdminBook>>(`${BASE_ADMIN}/${safe(bookId)}`, {
      headers: withCookie(accessToken),
    });
  },

  adminGetBySlug(accessToken: string, slug: string) {
    return http.get<ApiResponse<AdminBook>>(
      `${BASE_ADMIN}/slug/${safe(slug)}`,
      {
        headers: withCookie(accessToken),
      }
    );
  },

  adminCreate(accessToken: string, body: CreateBookRequest) {
    return http.post<ApiResponse<AdminBook>>(BASE_ADMIN, body, {
      headers: withCookie(accessToken),
    });
  },

  adminUpdate(accessToken: string, bookId: string, body: UpdateBookRequest) {
    return http.patch<ApiResponse<AdminBook>>(
      `${BASE_ADMIN}/${safe(bookId)}`,
      body,
      {
        headers: withCookie(accessToken),
      }
    );
  },

  adminDelete(accessToken: string, bookId: string) {
    return http.delete<ApiResponse<null>>(
      `${BASE_ADMIN}/${safe(bookId)}`,
      null,
      {
        headers: withCookie(accessToken),
      }
    );
  },

  adminRestore(accessToken: string, bookId: string) {
    return http.patch<ApiResponse<null>>(
      `${BASE_ADMIN}/${safe(bookId)}/restore`,
      null,
      {
        headers: withCookie(accessToken),
      }
    );
  },

  getTrendingRecommendations(params?: {
  limit?: number;
  includeWebData?: boolean;
}) {
  return http.get<ApiResponse<AdminTrendingBooksResponse>>(
    `${BASE_ADMIN}/recommendations/trending`,
    {
      params: params,
      credentials: "include",
      cache: "no-store",
    }
  );
},

  adminPublish(accessToken: string, bookId: string) {
    return http.post<ApiResponse<AdminBook>>(
      `${BASE_ADMIN}/${safe(bookId)}/publish`,
      null,
      {
        headers: withCookie(accessToken),
      }
    );
  },
};
