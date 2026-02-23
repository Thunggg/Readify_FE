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
