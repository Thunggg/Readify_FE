"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import {
  MoreHorizontal,
  Search,
  Trash2,
  Eye,
  Pencil,
  Loader2,
} from "lucide-react";

import { BlogApiRequest } from "@/api-request/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { handleErrorApi } from "@/lib/utils";
import type {
  AdminBlogListParams,
  AdminBlogPost,
  BlogCategory,
  BlogPostStatus,
} from "@/types/blog";
import type { PaginationMeta } from "@/types/api";
import PaginationControls from "../accounts/components/pagination-controls";

const STATUS_OPTIONS: { label: string; value: BlogPostStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const SORT_OPTIONS: {
  label: string;
  value: NonNullable<AdminBlogListParams["sortBy"]>;
}[] = [
  { label: "Mới nhất", value: "newest" },
  { label: "Cũ nhất", value: "oldest" },
  { label: "Phổ biến", value: "popular" },
  { label: "Tiêu đề", value: "title" },
  { label: "Ngày publish", value: "publishedAt" },
];

const statusBadgeClass: Record<BlogPostStatus, string> = {
  draft:
    "border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  published:
    "border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
  archived:
    "border-none bg-muted text-muted-foreground",
};

export default function BlogsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = (() => {
    const value = searchParams.get("status") ?? "all";
    return value === "draft" || value === "published" || value === "archived" ? value : "all";
  })();
  const currentCategory = searchParams.get("category") ?? "all";
  const currentSortBy = (() => {
    const value = searchParams.get("sortBy") as AdminBlogListParams["sortBy"] | null;
    return value && SORT_OPTIONS.some((item) => item.value === value) ? value : "newest";
  })();
  const currentPage = (() => {
    const pageParam = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  })();

  const [blogs, setBlogs] = useState<AdminBlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedSearchInput = useDebounce(searchInput, 350);
  const [limit] = useState(10);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const nextQuery = params.toString();
      const currentQuery = searchParams.toString();
      if (nextQuery !== currentQuery) {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
      }
    },
    [searchParams, router, pathname],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await BlogApiRequest.getCategories();
      if (res && res.payload.success) {
        setCategories((res.payload.data as BlogCategory[]) ?? []);
      }
    } catch {
      // ignore category failures and keep table functional
    }
  }, []);

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AdminBlogListParams = {
        page: currentPage,
        limit,
        sortBy: currentSortBy,
      };

      if (currentSearch.trim()) params.search = currentSearch.trim();
      if (currentStatus !== "all") params.status = currentStatus as BlogPostStatus;
      if (currentCategory !== "all") params.category = currentCategory;

      const res = await BlogApiRequest.getAdminBlogs(params);
      if (!res) {
        setBlogs([]);
        setMeta(null);
        return;
      }

      if (!res.payload.success) {
        handleErrorApi({ error: res.payload.message });
        return;
      }

      setBlogs(res.payload.data.items ?? []);
      setMeta(res.payload.data.meta ?? null);
    } catch (error) {
      handleErrorApi({ error });
      setBlogs([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, currentSortBy, currentSearch, currentStatus, currentCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const nextSearch = debouncedSearchInput.trim();
    const current = currentSearch.trim();
    if (nextSearch !== current) {
      updateParams({ search: nextSearch || undefined, page: "1" });
    }
  }, [debouncedSearchInput, currentSearch, updateParams]);

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      return;
    }

    try {
      const res = await BlogApiRequest.deleteBlogPost(slug);
      if (!res) {
        handleErrorApi({ error: "Không thể xóa bài viết" });
        return;
      }

      if (!res.payload.success) {
        handleErrorApi({ error: res.payload.message });
        return;
      }
      await fetchBlogs();
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const totalPages =
    meta?.totalPages ??
    (meta?.total ? Math.max(1, Math.ceil(meta.total / (meta.limit || limit))) : 1);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, nội dung..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={currentStatus}
              onValueChange={(value) => {
                updateParams({ status: value, page: "1" });
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {STATUS_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentCategory}
              onValueChange={(value) => {
                updateParams({ category: value, page: "1" });
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item._id} value={item.slug}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentSortBy}
              onValueChange={(v) => {
                updateParams({ sortBy: v, page: "1" });
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">Ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Comments</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  Không có bài viết phù hợp
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>
                    {blog.featuredImage ? (
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="h-12 w-16 rounded object-cover border"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <div className="font-medium line-clamp-1">{blog.title}</div>
                    <div className="text-xs text-muted-foreground">{blog.slug}</div>
                  </TableCell>
                  <TableCell>{blog.category?.name ?? "-"}</TableCell>
                  <TableCell>
                    {blog.author
                      ? `${blog.author.firstName ?? ""} ${blog.author.lastName ?? ""}`.trim() || "-"
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBadgeClass[blog.status]}>{blog.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{blog.viewCount ?? 0}</TableCell>
                  <TableCell className="text-center">{blog.commentCount ?? 0}</TableCell>
                  <TableCell>
                    {dayjs(blog.createdAt).isValid()
                      ? dayjs(blog.createdAt).format("DD/MM/YYYY HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/blog/${blog._id}`}>
                            <Eye className="mr-2 size-4" />
                            Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/blog/${blog._id}/edit`}>
                            <Pencil className="mr-2 size-4" />
                            Chỉnh sửa
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            handleDelete(blog.slug);
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {meta
            ? `Hiển thị ${(meta.page - 1) * meta.limit + 1} - ${Math.min(meta.page * meta.limit, meta.total)} trên ${meta.total} bài viết`
            : ""}
        </p>
        {totalPages > 1 && (
          <PaginationControls
            currentPage={meta?.page ?? currentPage}
            totalPages={totalPages}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        )}
      </div>
    </div>
  );
}
