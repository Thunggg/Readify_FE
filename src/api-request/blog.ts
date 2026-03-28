import http from '@/lib/http';
import type { ApiResponse, ApiPaginatedResponse } from '@/types/api';
import type {
  BlogPost,
  BlogPostDetail,
  BlogCategory,
  SearchBlogParams,
  AdminBlogListParams,
  AdminBlogPost,
  AdminBlogPostDetail,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogComment,
  AdminBlogCommentListParams,
  BlogCommentStatus,
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

  /** Admin: lấy danh sách bài viết */
  getAdminBlogs(params?: AdminBlogListParams) {
    return http.get<ApiPaginatedResponse<AdminBlogPost>>(`${BASE}/admin/posts`, {
      params,
      credentials: 'include',
      cache: 'no-store',
    });
  },

  /** Admin: lấy chi tiết bài viết theo id */
  getAdminBlogDetail(id: string) {
    return http.get<ApiResponse<AdminBlogPostDetail>>(`${BASE}/admin/posts/${id}`, {
      credentials: 'include',
      cache: 'no-store',
    });
  },

  /** Admin: tạo bài viết */
  createBlogPost(body: CreateBlogPostRequest) {
    return http.post<ApiResponse<AdminBlogPostDetail>>(`${BASE}/posts`, body, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /** Admin: cập nhật bài viết theo slug */
  updateBlogPost(slug: string, body: UpdateBlogPostRequest) {
    return http.put<ApiResponse<AdminBlogPostDetail>>(`${BASE}/posts/${slug}`, body, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /** Admin: xóa bài viết theo slug */
  deleteBlogPost(slug: string) {
    return http.delete<ApiResponse<null>>(`${BASE}/posts/${slug}`, null, {
      credentials: 'include',
    });
  },

  /** Admin: lấy danh sách bình luận */
  getAdminComments(params?: AdminBlogCommentListParams) {
    return http.get<ApiPaginatedResponse<BlogComment>>(`${BASE}/comments/admin`, {
      params,
      credentials: 'include',
      cache: 'no-store',
    });
  },

  /** Admin: cập nhật trạng thái bình luận */
  updateCommentStatus(id: string, status: BlogCommentStatus) {
    return http.put<ApiResponse<BlogComment>>(
      `${BASE}/comments/${id}/status`,
      { status },
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  },

  /** Admin: xóa bình luận */
  deleteComment(id: string) {
    return http.delete<ApiResponse<null>>(`${BASE}/comments/${id}`, null, {
      credentials: 'include',
    });
  },
};
