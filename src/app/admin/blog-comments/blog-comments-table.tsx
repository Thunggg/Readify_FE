"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { Check, ChevronsUpDown, Loader2, MoreHorizontal, Search, Trash2, X } from "lucide-react";

import { BlogApiRequest } from "@/api-request/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { cn, handleErrorApi } from "@/lib/utils";
import type { PaginationMeta } from "@/types/api";
import type {
  AdminBlogCommentListParams,
  AdminBlogPost,
  BlogComment,
  BlogCommentStatus,
} from "@/types/blog";
import PaginationControls from "../accounts/components/pagination-controls";

const STATUS_OPTIONS: { label: string; value: BlogCommentStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Spam", value: "spam" },
];

const statusClass: Record<BlogCommentStatus, string> = {
  pending:
    "border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  approved:
    "border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
  rejected:
    "border-none bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400",
  spam: "border-none bg-muted text-muted-foreground",
};

export default function BlogCommentsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = (() => {
    const value = searchParams.get("status") ?? "all";
    return STATUS_OPTIONS.some((item) => item.value === value) ? value : "all";
  })();
  const currentSortBy = (() => {
    const value = searchParams.get("sortBy") ?? "newest";
    return value === "oldest" ? "oldest" : "newest";
  })();
  const currentPage = (() => {
    const pageParam = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  })();
  const currentPostId = searchParams.get("postId") ?? "";

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedSearchInput = useDebounce(searchInput, 350);

  const [blogFilterOpen, setBlogFilterOpen] = useState(false);
  const [blogFilterInput, setBlogFilterInput] = useState("");
  const debouncedBlogFilterInput = useDebounce(blogFilterInput, 300);
  const [blogOptions, setBlogOptions] = useState<AdminBlogPost[]>([]);
  const [selectedBlogTitle, setSelectedBlogTitle] = useState("");
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);

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

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AdminBlogCommentListParams = {
        page: currentPage,
        limit,
        sortBy: currentSortBy,
      };

      if (currentSearch.trim()) params.search = currentSearch.trim();
      if (currentStatus !== "all") params.status = currentStatus as BlogCommentStatus;
      if (currentPostId) params.postId = currentPostId;

      const res = await BlogApiRequest.getAdminComments(params);
      if (!res) {
        setComments([]);
        setMeta(null);
        return;
      }

      if (!res.payload.success) {
        handleErrorApi({ error: res.payload.message });
        return;
      }

      setComments(res.payload.data.items ?? []);
      setMeta(res.payload.data.meta ?? null);
    } catch (error) {
      handleErrorApi({ error });
      setComments([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, currentSortBy, currentSearch, currentStatus, currentPostId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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

  useEffect(() => {
    let cancelled = false;

    const fetchBlogOptions = async () => {
      const keyword = debouncedBlogFilterInput.trim();
      if (keyword.length < 2) {
        if (!cancelled) setBlogOptions([]);
        return;
      }

      setIsLoadingBlogs(true);
      try {
        const res = await BlogApiRequest.getAdminBlogs({
          search: keyword,
          page: 1,
          limit: 20,
          sortBy: "newest",
        });

        if (!cancelled && res && res.payload.success) {
          setBlogOptions((res.payload.data.items as AdminBlogPost[]) ?? []);
        }
      } catch {
        if (!cancelled) setBlogOptions([]);
      } finally {
        if (!cancelled) setIsLoadingBlogs(false);
      }
    };

    fetchBlogOptions();
    return () => {
      cancelled = true;
    };
  }, [debouncedBlogFilterInput]);

  useEffect(() => {
    let cancelled = false;

    const fetchSelectedBlog = async () => {
      if (!currentPostId) {
        setSelectedBlogTitle("");
        return;
      }

      const foundInOptions = blogOptions.find((item) => item._id === currentPostId);
      if (foundInOptions?.title) {
        setSelectedBlogTitle(foundInOptions.title);
        return;
      }

      try {
        const res = await BlogApiRequest.getAdminBlogDetail(currentPostId);
        if (!cancelled && res && res.payload.success) {
          const detail = res.payload.data as { title?: string };
          setSelectedBlogTitle(detail.title ?? "");
        }
      } catch {
        if (!cancelled) setSelectedBlogTitle("");
      }
    };

    fetchSelectedBlog();
    return () => {
      cancelled = true;
    };
  }, [currentPostId, blogOptions]);

  const handleStatusUpdate = async (id: string, nextStatus: BlogCommentStatus) => {
    try {
      const res = await BlogApiRequest.updateCommentStatus(id, nextStatus);
      if (!res) {
        handleErrorApi({ error: "Không thể cập nhật trạng thái bình luận" });
        return;
      }

      if (!res.payload.success) {
        handleErrorApi({ error: res.payload.message });
        return;
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === id ? { ...comment, status: nextStatus } : comment,
        ),
      );
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      return;
    }

    try {
      const res = await BlogApiRequest.deleteComment(id);
      if (!res) {
        handleErrorApi({ error: "Không thể xóa bình luận" });
        return;
      }

      if (!res.payload.success) {
        handleErrorApi({ error: res.payload.message });
        return;
      }

      setComments((prev) => prev.filter((comment) => comment._id !== id));
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
              placeholder="Tìm kiếm nội dung, email, tên tác giả..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Popover open={blogFilterOpen} onOpenChange={setBlogFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={blogFilterOpen}
                  className="w-full sm:w-[260px] justify-between gap-2 font-normal"
                  title={currentPostId ? selectedBlogTitle || currentPostId : "Lọc theo bài viết"}
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {currentPostId ? selectedBlogTitle || currentPostId : "Lọc theo bài viết"}
                  </span>
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Nhập tên bài viết (>=2 ký tự)..."
                    value={blogFilterInput}
                    onValueChange={setBlogFilterInput}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {blogFilterInput.trim().length < 2
                        ? "Nhập ít nhất 2 ký tự để tìm bài viết"
                        : "Không tìm thấy bài viết"}
                    </CommandEmpty>
                    <CommandGroup>
                      {isLoadingBlogs ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground">Đang tìm bài viết...</div>
                      ) : (
                        blogOptions.map((blog) => (
                          <CommandItem
                            key={blog._id}
                            value={blog._id}
                            onSelect={() => {
                              updateParams({ postId: blog._id, page: "1" });
                              setSelectedBlogTitle(blog.title);
                              setBlogFilterOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                currentPostId === blog._id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate">{blog.title}</span>
                              <span className="text-xs text-muted-foreground truncate">{blog.slug}</span>
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {currentPostId && (
              <Button
                type="button"
                variant="ghost"
                className="sm:w-auto"
                onClick={() => updateParams({ postId: undefined, page: "1" })}
              >
                <X className="mr-2 size-4" />
                Bỏ lọc bài viết
              </Button>
            )}

            <Select
              value={currentStatus}
              onValueChange={(value) => updateParams({ status: value, page: "1" })}
            >
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {STATUS_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentSortBy}
              onValueChange={(v) => updateParams({ sortBy: v as "newest" | "oldest", page: "1" })}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Bài viết</TableHead>
              <TableHead className="w-[220px]">Tác giả</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : comments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Không có bình luận phù hợp
                </TableCell>
              </TableRow>
            ) : (
              comments.map((comment) => (
                <TableRow key={comment._id}>
                  <TableCell>
                    <div className="font-medium line-clamp-2">{comment.post?.title ?? "-"}</div>
                    <div className="text-xs text-muted-foreground">{comment.post?.slug ?? ""}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{comment.authorName}</div>
                    <div className="text-xs text-muted-foreground">{comment.authorEmail}</div>
                  </TableCell>
                  <TableCell className="max-w-[520px]">
                    <p className="line-clamp-2">{comment.content}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusClass[comment.status]}>{comment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {dayjs(comment.createdAt).isValid()
                      ? dayjs(comment.createdAt).format("DD/MM/YYYY HH:mm")
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
                        {STATUS_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onSelect={(e) => {
                              e.preventDefault();
                              handleStatusUpdate(comment._id, option.value);
                            }}
                          >
                            Đặt trạng thái: {option.label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            handleDelete(comment._id);
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Xóa bình luận
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
            ? `Hiển thị ${(meta.page - 1) * meta.limit + 1} - ${Math.min(meta.page * meta.limit, meta.total)} trên ${meta.total} bình luận`
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
