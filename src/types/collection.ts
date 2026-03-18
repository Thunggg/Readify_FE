export type CollectionBookRef = {
  _id: string;
  title?: string;
  slug?: string;
  thumbnailUrl?: string;
  status?: number;
  basePrice?: number;
  soldCount?: number;
};

export type AdminCollection = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  bookIds?: string[] | CollectionBookRef[];
  totalBooks?: number;
  status: number;
  sortOrder: number;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCollectionBody = {
  name: string;
  description?: string;
  coverImageUrl?: string;
  bookIds?: string[];
  status?: number;
  sortOrder?: number;
};

export type UpdateCollectionBody = {
  name?: string;
  description?: string;
  coverImageUrl?: string;
  bookIds?: string[];
  status?: number;
  sortOrder?: number;
};

export type AddBooksToCollectionBody = {
  bookIds: string[];
};
