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

  const errorFieldOrder = ["title", "excerpt", "content", "categoryId", "tags", "featuredImage"] as const;

  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstField = errorFieldOrder.find((field) => errors[field]);
    if (!firstField) return;

    const target =
      document.getElementById(`field-${firstField}`) ??
      document.getElementById(firstField);

    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      target.focus({ preventScroll: true });
    }
  };

  const mapBackendFieldErrors = (source: any): Record<string, string> => {
    const details = source?.data?.details ?? source?.details ?? source?.payload?.data?.details ?? source?.payload?.details;
    if (!Array.isArray(details)) return {};

    const mapped: Record<string, string> = {};
    details.forEach((detail: any) => {
      const field = typeof detail?.field === "string" ? detail.field.trim() : "";
      const message = typeof detail?.message === "string" ? detail.message : "Dữ liệu không hợp lệ";
      if (!field) return;
      mapped[field] = message;
    });

    return mapped;
  };

  const submitLabel = mode === "create" ? "Create post" : "Save changes";

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
    if (title.trim().length > 0 && title.trim().length < 2) {
      errors.title = "Tiêu đề cần ít nhất 2 ký tự";
    }

    if (!content.trim()) errors.content = "Content is required";
    if (!categoryId) errors.categoryId = "Please select a category";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors);
    }
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
    setFieldErrors({});
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
          handleErrorApi({ error: "Unable to create post" });
          return;
        }

        if (!res.payload.success) {
          const backendErrors = mapBackendFieldErrors(res.payload);
          if (Object.keys(backendErrors).length > 0) {
            setFieldErrors(backendErrors);
            scrollToFirstError(backendErrors);
          }
          handleErrorApi({ error: res.payload.message });
          return;
        }
      } else {
        const slug = initialData?.slug;
        if (!slug) {
          handleErrorApi({ error: "Post slug not found" });
          return;
        }

        const res = await BlogApiRequest.updateBlogPost(slug, body);
        if (!res) {
          handleErrorApi({ error: "Unable to update post" });
          return;
        }

        if (!res.payload.success) {
          const backendErrors = mapBackendFieldErrors(res.payload);
          if (Object.keys(backendErrors).length > 0) {
            setFieldErrors(backendErrors);
            scrollToFirstError(backendErrors);
          }
          handleErrorApi({ error: res.payload.message });
          return;
        }
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      const backendErrors = mapBackendFieldErrors(error);
      if (Object.keys(backendErrors).length > 0) {
        setFieldErrors(backendErrors);
        scrollToFirstError(backendErrors);
      }
      handleErrorApi({ error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {Object.keys(fieldErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Please review your input</AlertTitle>
          <AlertDescription>
            Some required fields are invalid. Please update the form and try again.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Post information</CardTitle>
          <CardDescription>Enter title, excerpt, and main content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFieldErrors((prev) => {
                  if (!prev.title) return prev;
                  const next = { ...prev };
                  delete next.title;
                  return next;
                });
              }}
              placeholder="Enter post title"
            />
            {fieldErrors.title && <p className="text-sm text-destructive">{fieldErrors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Tóm tắt</Label>
            <Textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                setFieldErrors((prev) => {
                  if (!prev.excerpt) return prev;
                  const next = { ...prev };
                  delete next.excerpt;
                  return next;
                });
              }}
              placeholder="Short summary of the post content"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={14}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setFieldErrors((prev) => {
                  if (!prev.content) return prev;
                  const next = { ...prev };
                  delete next.content;
                  return next;
                });
              }}
              placeholder="Post content (you can paste HTML if needed)"
            />
            {fieldErrors.content && <p className="text-sm text-destructive">{fieldErrors.content}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thiết lập hiển thị</CardTitle>
          <CardDescription>Category, publish status, and metadata</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value);
                setFieldErrors((prev) => {
                  if (!prev.categoryId) return prev;
                  const next = { ...prev };
                  delete next.categoryId;
                  return next;
                });
              }}
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Select category" />
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
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published") }>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Related book (optional)</Label>
            <Popover open={bookOpen} onOpenChange={setBookOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={bookOpen}
                  className="w-full justify-between font-normal"
                >
                  {bookId ? bookTitle || bookId : "Search and select related book..."}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Enter book title (at least 2 characters)..."
                    value={bookSearch}
                    onValueChange={setBookSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {bookSearch.trim().length < 2
                        ? "Enter at least 2 characters to search books"
                        : "No books found"}
                    </CommandEmpty>
                    <CommandGroup>
                      {isLoadingBooks ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          Searching books...
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
                Remove linked book
              </Button>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => {
                setTagsInput(e.target.value);
                setFieldErrors((prev) => {
                  if (!prev.tags) return prev;
                  const next = { ...prev };
                  delete next.tags;
                  return next;
                });
              }}
              placeholder="Ví dụ: review, ky nang, sach hay"
            />
            {fieldErrors.tags && <p className="text-sm text-destructive">{fieldErrors.tags}</p>}
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
          <CardTitle>Post image</CardTitle>
          <CardDescription>Upload ảnh đại diện blog từ máy tính</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4" id="field-featuredImage">
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
                Remove image
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
          {fieldErrors.featuredImage && (
            <p className="text-sm text-destructive">{fieldErrors.featuredImage}</p>
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
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting || isUploading}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

