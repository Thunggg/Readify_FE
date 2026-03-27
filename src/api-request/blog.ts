import http from '@/lib/http';
import type { ApiResponse, ApiPaginatedResponse } from '@/types/api';
import type {
  BlogPost,
  BlogPostDetail,
  BlogCategory,
  BlogPostLikeStatus,
  SearchBlogParams,
} from '@/types/blog';

const BASE = '/blog';

export const BlogApiRequest = {
  /** Lấy danh sách bài viết (public, paginated) */
  getBlogs(params?: SearchBlogParams) {
    return http.get<ApiPaginatedResponse<BlogPost>>(`${BASE}/posts`, {
      params,
    });
  },

  /** Lấy chi tiết bài viết theo slug */
  getBlogBySlug(slug: string) {
    return http.get<ApiResponse<BlogPostDetail>>(`${BASE}/posts/${slug}`);
  },

  /** Lấy bài viết liên quan */
  getRelatedPosts(postId: string, limit?: number) {
    return http.get<ApiResponse<BlogPost[]>>(`${BASE}/posts/${postId}/related`, {
      params: limit ? { limit } : undefined,
    });
  },

  /** Lấy danh sách danh mục blog */
  getCategories() {
    return http.get<ApiResponse<BlogCategory[]>>(`${BASE}/categories`);
  },

  // ─── ADMIN ──────────────────────────────────────────

  adminGetCategories(params?: any) {
    return http.get<ApiPaginatedResponse<BlogCategory>>(`/admin/blog-categories`, {
      params,
      credentials: "include",
      cache: "no-store",
    });
  },

  adminGetCategoryById(id: string) {
    return http.get<ApiResponse<BlogCategory & { recentPosts: any[] }>>(`/admin/blog-categories/${id}`, {
      credentials: "include",
      cache: "no-store",
    });
  },

  adminCreateCategory(body: { name: string; slug: string; description?: string; icon?: string }) {
    return http.post<ApiResponse<BlogCategory>>(`/admin/blog-categories`, body, {
      credentials: "include",
    });
  },

  adminUpdateCategory(id: string, body: { name?: string; slug?: string; description?: string; icon?: string }) {
    return http.put<ApiResponse<BlogCategory>>(`/admin/blog-categories/${id}`, body, {
      credentials: "include",
    });
  },

  adminDeleteCategory(id: string) {
    return http.delete<ApiResponse<null>>(`/admin/blog-categories/${id}`, undefined, {
      credentials: "include",
    });
  },

  // ─── LIKES (Customer) ─────────────────────────────────────────────
  getPostLikeStatus(postId: string) {
    return http.get<ApiResponse<BlogPostLikeStatus>>(`/blog/posts/${postId}/like`, {
      cache: "no-store",
    });
  },

  likePost(postId: string) {
    return http.post<ApiResponse<BlogPostLikeStatus>>(
      `/blog/posts/${postId}/like`,
      {},
      { cache: "no-store" },
    );
  },

  unlikePost(postId: string) {
    return http.delete<ApiResponse<BlogPostLikeStatus>>(`/blog/posts/${postId}/like`, undefined, {
      cache: "no-store",
    });
  },
};
