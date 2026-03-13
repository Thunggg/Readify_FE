export type PublicBook = {
  _id: string;
  title: string;
  slug: string;

  thumbnailUrl: string;

  images?: {
    _id: string;
    url: string;
  }[];

  authors: {
    _id: string;
    name: string;
    slug: string;
  }[];

  categoryIds: {
    _id: string;
    name: string;
    slug: string;
  }[];

  basePrice: number;
  currency: string;

  averageRating?: number;
  totalReviews?: number;

  isInStock?: boolean;

  soldCount?: number;

  tags?: string[];

  createdAt: string;
};

export type PublicBookDetail = PublicBook & {
  subtitle?: string;
  description?: string;

  publisherId?: {
    _id: string;
    name: string;
  };

  publishDate?: string;
  pageCount?: number;
  language?: string;
  isbn?: string;
};

export type SearchPublicBooksParams = {
  page?: number;
  limit?: number;

  q?: string;
  sex?: number;
  categoryId?: string;

  minPrice?: number;
  maxPrice?: number;

  inStock?: boolean;

  sort?:
    | "newest"
    | "oldest"
    | "price_asc"
    | "price_desc"
    | "best_selling"
    | "rating_desc";
};

export type SearchBookSuggestion = {
  q: string;
  limit?: number;
};

export type BookSuggestion = {
  _id: string;
  title: string;
  slug: string;
  authors: {
    _id: string;
    name: string;
    slug: string;
  }[];
  thumbnailUrl: string;
};

export type AdminBook = PublicBookDetail & {
  isDeleted?: boolean;
  deletedAt?: string;

  status?: number;
  soldCount?: number;

  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;

  stock?: {
    quantity: number;
    location: string;
    price?: number;
    batch?: string;
    status: string;
    lastUpdated?: string;
  } | null;
};

// ===== ADMIN SEARCH PARAMS =====
export type SearchAdminBooksParams = {
  q?: string;
  publisherId?: string;
  categoryId?: string;
  status?: number;
  isDeleted?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "title" | "basePrice" | "soldCount";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

// ===== CREATE BOOK REQUEST =====
export type CreateBookRequest = {
  title: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  authors?: string[];
  language?: string;
  publishDate?: string;
  pageCount?: number;
  isbn?: string;
  publisherId: string;
  categoryIds: string[];
  basePrice: number;
  currency?: string;
  images?: string[];
  thumbnailUrl?: string;
  tags?: string[];
  initialQuantity?: number;
  stockLocation?: string;
};

// ===== UPDATE BOOK REQUEST =====
export type UpdateBookRequest = {
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  authors?: string[];
  language?: string;
  publishDate?: string;
  pageCount?: number;
  isbn?: string;
  publisherId?: string;
  categoryIds?: string[];
  basePrice?: number;
  currency?: string;
  addImages?: string[];
  removeImages?: string[];
  thumbnailUrl?: string;
  status?: number;
  tags?: string[];
  stockQuantity?: number;
  stockLocation?: string;
};
