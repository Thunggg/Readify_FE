"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Loader2, Upload, X } from "lucide-react";

import { BlogApiRequest } from "@/api-request/blog";
import { BookApiRequest } from "@/api-request/book";
import { MediaApiRequest } from "@/api-request/media";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { handleErrorApi } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MediaFolder, MediaType } from "@/types/media";
import type {
  BlogCategory,
  CreateBlogPostRequest,
  AdminBlogPostDetail,
} from "@/types/blog";
import type { BookSuggestion } from "@/types/book";

type BlogPostFormProps = {
  mode: "create" | "edit";
  categories?: BlogCategory[];
  initialData?: AdminBlogPostDetail;
};

export default function BlogPostForm({ mode, categories = [], initialData }: BlogPostFormProps) {
  const router = useRouter();
  const [availableCategories, setAvailableCategories] = useState<BlogCategory[]>(
    categories,
  );

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category?._id ?? "");
  const [bookId, setBookId] = useState(initialData?.book?._id ?? "");
  const [bookTitle, setBookTitle] = useState(initialData?.book?.title ?? "");
  const [bookOpen, setBookOpen] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const debouncedBookSearch = useDebounce(bookSearch, 350);
  const [bookSuggestions, setBookSuggestions] = useState<BookSuggestion[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status === "published" ? "published" : "draft",
  );
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage ?? "");
  const [tagsInput, setTagsInput] = useState((initialData?.tags ?? []).join(", "));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submitLabel = mode === "create" ? "Tạo bài viết" : "Lưu thay đổi";

  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput],
  );

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = "Tiêu đề là bắt buộc";
    if (title.trim().length > 0 && title.trim().length < 10) {
      errors.title = "Tiêu đề cần ít nhất 10 ký tự";
    }

    if (!content.trim()) errors.content = "Nội dung là bắt buộc";
    if (!categoryId) errors.categoryId = "Vui lòng chọn danh mục";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await MediaApiRequest.upload(file, {
        type: MediaType.IMAGE,
        folder: MediaFolder.BANNER,
      });

      if (!res) {
        handleErrorApi({ error: "Upload ảnh thất bại" });
        return;
      }

      if (!res.payload.success) {
        handleErrorApi({ error: res.payload.message });
        return;
      }

      const media = res.payload.data;
      setFeaturedImage(media.url);
    } catch (error) {
      handleErrorApi({ error });
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
    e.currentTarget.value = "";
  };

  useEffect(() => {
    if (categories.length > 0) {
      setAvailableCategories(categories);
      return;
    }

    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const res = await BlogApiRequest.getCategories();
        if (!cancelled && res && res.payload.success) {
          setAvailableCategories((res.payload.data as BlogCategory[]) ?? []);
        }
      } catch {
        // keep form usable even if category API fails
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [categories]);

  useEffect(() => {
    let cancelled = false;

    const fetchBookSuggestions = async () => {
      const keyword = debouncedBookSearch.trim();

      if (keyword.length < 2) {
        if (!cancelled) setBookSuggestions([]);
        return;
      }

      setIsLoadingBooks(true);
      try {
        const res = await BookApiRequest.getSuggestions({ q: keyword, limit: 15 });
        if (!cancelled && res && res.payload.success) {
          setBookSuggestions((res.payload.data as BookSuggestion[]) ?? []);
        }
      } catch {
        if (!cancelled) {
          setBookSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingBooks(false);
        }
      }
    };

    fetchBookSuggestions();
    return () => {
      cancelled = true;
    };
  }, [debouncedBookSearch]);

  const handleSubmit = async () => {
    if (!validate()) return;

    const body: CreateBlogPostRequest = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || undefined,
      featuredImage: featuredImage.trim() || undefined,
      categoryId,
      status,
      tags: tags.length ? tags : undefined,
      bookId: bookId.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const res = await BlogApiRequest.createBlogPost(body);
        if (!res) {
          handleErrorApi({ error: "Không thể tạo bài viết" });
          return;
        }

        if (!res.payload.success) {
          handleErrorApi({ error: res.payload.message });
          return;
        }
      } else {
        const slug = initialData?.slug;
        if (!slug) {
          handleErrorApi({ error: "Không tìm thấy slug của bài viết" });
          return;
        }

        const res = await BlogApiRequest.updateBlogPost(slug, body);
        if (!res) {
          handleErrorApi({ error: "Không thể cập nhật bài viết" });
          return;
        }

        if (!res.payload.success) {
          handleErrorApi({ error: res.payload.message });
          return;
        }
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      handleErrorApi({ error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {Object.keys(fieldErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Vui lòng kiểm tra lại dữ liệu</AlertTitle>
          <AlertDescription>
            Một số trường bắt buộc chưa hợp lệ. Hãy cập nhật form rồi thử lại.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài viết</CardTitle>
          <CardDescription>Nhập tiêu đề, tóm tắt và nội dung chính</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết"
            />
            {fieldErrors.title && <p className="text-sm text-destructive">{fieldErrors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Tóm tắt</Label>
            <Textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Tóm tắt ngắn về nội dung bài viết"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Nội dung</Label>
            <Textarea
              id="content"
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung bài viết (có thể dán HTML nếu cần)"
            />
            {fieldErrors.content && <p className="text-sm text-destructive">{fieldErrors.content}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thiết lập hiển thị</CardTitle>
          <CardDescription>Danh mục, trạng thái xuất bản và metadata</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Danh mục</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.categoryId && (
              <p className="text-sm text-destructive">{fieldErrors.categoryId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published") }>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Sách liên quan (tuỳ chọn)</Label>
            <Popover open={bookOpen} onOpenChange={setBookOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={bookOpen}
                  className="w-full justify-between font-normal"
                >
                  {bookId ? bookTitle || bookId : "Tìm và chọn sách liên quan..."}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Nhập tên sách (ít nhất 2 ký tự)..."
                    value={bookSearch}
                    onValueChange={setBookSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {bookSearch.trim().length < 2
                        ? "Nhập ít nhất 2 ký tự để tìm sách"
                        : "Không tìm thấy sách"}
                    </CommandEmpty>
                    <CommandGroup>
                      {isLoadingBooks ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          Đang tìm sách...
                        </div>
                      ) : (
                        bookSuggestions.map((book) => (
                          <CommandItem
                            key={book._id}
                            value={book._id}
                            onSelect={() => {
                              setBookId(book._id);
                              setBookTitle(book.title);
                              setBookOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                bookId === book._id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate">{book.title}</span>
                              {book.authors?.length > 0 && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {book.authors.map((author) => author.name).join(", ")}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {bookId && (
              <Button
                type="button"
                variant="ghost"
                className="h-auto p-0 text-muted-foreground"
                onClick={() => {
                  setBookId("");
                  setBookTitle("");
                  setBookSearch("");
                }}
              >
                <X className="mr-1 size-3" />
                Bỏ liên kết sách
              </Button>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ví dụ: review, ky nang, sach hay"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ảnh bài viết</CardTitle>
          <CardDescription>Upload ảnh đại diện blog từ máy tính</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => document.getElementById("blog-image-upload")?.click()}
            >
              {isUploading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              Upload ảnh blog
            </Button>

            {featuredImage && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFeaturedImage("")}
              >
                <X className="mr-2 size-4" />
                Xóa ảnh
              </Button>
            )}

            <input
              id="blog-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {featuredImage && (
            <img
              src={featuredImage}
              alt="Blog featured"
              className="h-52 w-full max-w-xl rounded-md border object-cover"
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blog")}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting || isUploading}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
