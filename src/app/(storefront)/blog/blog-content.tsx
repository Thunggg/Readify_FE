'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BlogApiRequest } from '@/api-request/blog';
import type { BlogPost, BlogCategory, SearchBlogParams } from '@/types/blog';
import type { PaginationMeta } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Eye, MessageCircle, Calendar } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

export function BlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  // URL params
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSort = (searchParams.get('sortBy') as SearchBlogParams['sortBy']) || 'newest';
  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('search') || '';

  // Update URL
  const updateParams = useCallback(
    (newParams: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (!value || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/blog?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await BlogApiRequest.getCategories();
        if (res && res.payload.success) {
          setCategories((res.payload.data as BlogCategory[]) ?? []);
        }
      } catch (err) {
        console.error('Failed to fetch blog categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const params: SearchBlogParams = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sortBy: currentSort,
        };
        if (currentCategory) params.category = currentCategory;
        if (currentTag) params.tag = currentTag;
        if (currentSearch) params.search = currentSearch;

        const res = await BlogApiRequest.getBlogs(params);
        if (res && res.payload.success) {
          setPosts(res.payload.data.items ?? []);
          setMeta(res.payload.data.meta ?? null);
        }
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [currentPage, currentSort, currentCategory, currentTag, currentSearch]);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput || undefined, page: '1' });
  };

  const handleSortChange = (value: string) => {
    updateParams({ sortBy: value, page: '1' });
  };

  const handleCategoryChange = (slug: string) => {
    updateParams({
      category: slug === currentCategory ? undefined : slug,
      page: '1',
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Pagination
  const renderPagination = () => {
    if (!meta || !meta.totalPages || meta.totalPages <= 1) return null;
    const totalPages = meta.totalPages;
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pages.map((page, idx) => (
            <PaginationItem key={idx}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
              className={
                currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="w-full aspect-[16/9] rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty
  const renderEmpty = () => (
    <div className="text-center py-16">
      <h3 className="text-lg font-semibold mb-2">Không tìm thấy bài viết</h3>
      <p className="text-muted-foreground mb-4">
        Không có bài viết nào phù hợp với bộ lọc hiện tại.
      </p>
      <Button variant="outline" onClick={() => router.push('/blog')}>
        Xóa bộ lọc
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Khám phá các bài viết, tin tức và đánh giá sách mới nhất
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>

        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="popular">Phổ biến nhất</SelectItem>
            <SelectItem value="title">Theo tiêu đề</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={!currentCategory ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => updateParams({ category: undefined, page: '1' })}
          >
            Tất cả
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat._id}
              variant={currentCategory === cat.slug ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
              {cat.postCount > 0 && (
                <span className="ml-1 text-xs opacity-70">({cat.postCount})</span>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Result count */}
      {meta && !isLoading && (
        <p className="text-sm text-muted-foreground mb-4">
          Hiển thị <span className="font-semibold text-foreground">{posts.length}</span> trong{' '}
          {meta.total} bài viết
        </p>
      )}

      {/* Blog Grid */}
      {isLoading ? (
        renderSkeleton()
      ) : posts.length === 0 ? (
        renderEmpty()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="group">
              <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
                {/* Featured image */}
                <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Category badge */}
                  {post.category && (
                    <Badge variant="secondary" className="text-xs">
                      {post.category.name}
                    </Badge>
                  )}

                  {/* Title */}
                  <h2 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.viewCount ?? 0}
                    </span>
                    {post.commentCount !== undefined && post.commentCount > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.commentCount}
                      </span>
                    )}
                  </div>

                  {/* Author */}
                  {post.author && (
                    <div className="flex items-center gap-2 pt-1">
                      {post.author.avatarUrl ? (
                        <Image
                          src={post.author.avatarUrl}
                          alt={`${post.author.firstName} ${post.author.lastName}`}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {post.author.firstName?.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {post.author.firstName} {post.author.lastName}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && posts.length > 0 && renderPagination()}
    </div>
  );
}
