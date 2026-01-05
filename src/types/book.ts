export type PublicBook = {
  _id: string;
  title: string;
  slug: string;

  coverImage: string;
  images?: string[];

  authors: string[];
  categories: {
    _id: string;
    name: string;
    slug: string;
  }[];

  basePrice: number;
  originalPrice?: number;

  // averageRating?: number;
  // totalReviews?: number;
  soldCount?: number;

  // isInStock?: boolean;
  status: number;

  createdAt: string;
  updatedAt: string;
};

export type PublicBookDetail = PublicBook & {
  description?: string;
  publisher?: string;
  publishDate?: string;

  pages?: number;
  language?: string;
  isbn?: string;

  tags?: string[];
};

export type SearchPublicBooksParams = {
  page?: number;
  limit?: number;

  q?: string;
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
  authors: string[];
  thumbnailUrl: string;
};

export type AdminBook = PublicBookDetail & {
  isDeleted?: boolean;
  deletedAt?: string;

  createdBy?: string;
  updatedBy?: string;
};
