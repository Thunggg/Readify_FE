// ─── Blog Post (list item) ───────────────────────────
export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  category?: { _id: string; name: string; slug: string };
  author?: { _id: string; firstName: string; lastName: string; avatarUrl?: string };
  tags?: string[];
  viewCount: number;
  commentCount?: number;
  publishedAt?: string;
  createdAt: string;
};

// ─── Blog Post Detail (full content) ─────────────────
export type BlogPostDetail = BlogPost & {
  content: string;
  book?: { _id: string; title: string; slug: string; thumbnailUrl?: string };
  status: string;
};

// ─── Blog Category ───────────────────────────────────
export type BlogCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  postCount: number;
};

// ─── Search Params ───────────────────────────────────
export type SearchBlogParams = {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'title';
};

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export type AdminBlogListParams = {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  author?: string;
  status?: BlogPostStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'title' | 'publishedAt';
};

export type AdminBlogPost = BlogPost & {
  status: BlogPostStatus;
};

export type AdminBlogPostDetail = BlogPostDetail & {
  status: BlogPostStatus;
};

export type CreateBlogPostRequest = {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  bookId?: string;
  categoryId: string;
  tags?: string[];
  status?: 'draft' | 'published';
};

export type UpdateBlogPostRequest = CreateBlogPostRequest;

export type BlogCommentStatus = 'pending' | 'approved' | 'spam' | 'rejected';

export type BlogComment = {
  _id: string;
  post?: {
    _id: string;
    title: string;
    slug?: string;
  };
  user?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  authorName: string;
  authorEmail: string;
  content: string;
  status: BlogCommentStatus;
  parent?: string;
  createdAt: string;
};

export type AdminBlogCommentListParams = {
  page?: number;
  limit?: number;
  postId?: string;
  userId?: string;
  status?: BlogCommentStatus;
  search?: string;
  sortBy?: 'newest' | 'oldest';
};
