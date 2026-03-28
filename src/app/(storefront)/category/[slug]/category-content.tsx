"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { BookApiRequest } from "@/api-request/book";
import { CategoryApiRequest, type Category } from "@/api-request/category";
import { BookCard } from "@/components/storefront/book-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaginationMeta } from "@/types/api";
import type { PublicBook, SearchPublicBooksParams } from "@/types/book";

const ITEMS_PER_PAGE = 12;

type SortOption = SearchPublicBooksParams["sort"];

interface CategoryContentProps {
  slug: string;
  categoryName?: string;
}

export function CategoryContent({ slug, categoryName }: CategoryContentProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);

  const [books, setBooks] = useState<PublicBook[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const title = useMemo(() => {
    if (category?.name) return category.name;
    if (categoryName) return categoryName;
    return slug;
  }, [category?.name, categoryName, slug]);

  // Fetch category by slug
  useEffect(() => {
    let cancelled = false;

    const fetchCategory = async () => {
      setIsLoadingCategory(true);
      try {
        const res = await CategoryApiRequest.getCategories({ status: 1 });
        const found = res?.payload?.success
          ? res.payload.data.find((c) => c.slug === slug) ?? null
          : null;

        if (!cancelled) {
          setCategory(found);
          setPage(1);
        }
      } catch (e) {
        if (!cancelled) setCategory(null);
      } finally {
        if (!cancelled) setIsLoadingCategory(false);
      }
    };

    fetchCategory();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Fetch books in category
  useEffect(() => {
    let cancelled = false;

    const fetchBooks = async () => {
      if (!category?._id) {
        setBooks([]);
        setMeta(null);
        setIsLoadingBooks(false);
        return;
      }

      setIsLoadingBooks(true);
      try {
        const params: SearchPublicBooksParams = {
          page,
          limit: ITEMS_PER_PAGE,
          sort: sortBy,
          categoryId: category._id,
        };

        const res = await BookApiRequest.getBooks(params);
        if (!cancelled && res?.payload?.success) {
          setBooks(res.payload.data.items);
          setMeta(res.payload.data.meta || null);
        }
      } catch (e) {
        if (!cancelled) {
          setBooks([]);
          setMeta(null);
        }
      } finally {
        if (!cancelled) setIsLoadingBooks(false);
      }
    };

    fetchBooks();
    return () => {
      cancelled = true;
    };
  }, [category?._id, page, sortBy]);

  const isLoading = isLoadingCategory || isLoadingBooks;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">
          {category ? (
            <>Khám phá sách trong thể loại {title.toLowerCase()}</>
          ) : isLoadingCategory ? (
            "Đang tải danh mục..."
          ) : (
            "Không tìm thấy danh mục"
          )}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Đang tải..."
          ) : (
            <>
              Hiển thị{" "}
              <span className="font-semibold text-foreground">
                {books.length}
              </span>{" "}
              sản phẩm
            </>
          )}
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={sortBy || "newest"}
            onValueChange={(v) => {
              setSortBy(v as SortOption);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="best_selling">Bán chạy</SelectItem>
              <SelectItem value="rating_desc">Đánh giá cao</SelectItem>
              <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
              <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
            </SelectContent>
          </Select>

          {category?._id && (
            <Button variant="outline" asChild className="h-9 shrink-0">
              <Link href={`/products?categoryId=${category._id}`}>
                Xem tất cả
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-2/3 rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      ) : !category ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Danh mục không tồn tại hoặc đã bị ẩn.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/discover">Quay lại khám phá</Link>
          </Button>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Chưa có sản phẩm nào trong thể loại này.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {books.map((book) => (
              <BookCard key={book._id} {...book} />
            ))}
          </div>

          {meta?.totalPages && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <div className="text-sm text-muted-foreground">
                Trang{" "}
                <span className="font-medium text-foreground">{page}</span>/
                {meta.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={page >= meta.totalPages}
                onClick={() =>
                  setPage((p) => Math.min(meta.totalPages as number, p + 1))
                }
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
