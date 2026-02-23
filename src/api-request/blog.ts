import http from '@/lib/http';
import type { ApiResponse, ApiPaginatedResponse } from '@/types/api';
import type {
  BlogPost,
  BlogPostDetail,
  BlogCategory,
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
};
