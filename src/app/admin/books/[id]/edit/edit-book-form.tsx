"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { AlertCircle, Check, CheckCircle2, ChevronsUpDown, Loader2, Save, Upload, X } from "lucide-react"
import { BookApiRequest } from "@/api-request/book"
import { CategoryApiRequest, type Category } from "@/api-request/category"
import { SupplierApiRequest, type Supplier } from "@/api-request/supplier"
import { AuthorApiRequest, type Author } from "@/api-request/author"
import { MediaApiRequest } from "@/api-request/media"
import { updateBookFormSchema, type UpdateBookFormInput } from "@/validation/book-schemas"
import type { AdminBook, UpdateBookRequest } from "@/types/book"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"

const BookStatusMap: Record<number, string> = {
  0: "Discontinued",
  1: "On sale",
  3: "Draft",
  4: "Out of stock",
}

type UploadedBookImage = {
  _id: string
  url: string
}

type BackendValidationDetail = {
  field?: string
  message?: string
}

const normalizeBackendField = (field?: string): string | null => {
  if (!field) return null

  const map: Record<string, string> = {
    slug: "title",
    categoryId: "categoryIds",
    categories: "categoryIds",
    imageIds: "images",
    addImages: "images",
    removeImages: "images",
    authorIds: "authors",
  }

  return map[field] ?? field
}

export function EditBookForm({ book }: { book: AdminBook }) {
  const getRefId = (ref: unknown): string => {
    if (typeof ref === "string") return ref
    if (
      typeof ref === "object" &&
      ref !== null &&
      "_id" in ref &&
      typeof (ref as { _id?: unknown })._id === "string"
    ) {
      return (ref as { _id: string })._id
    }
    return ""
  }

  const getRefName = (ref: unknown): string => {
    if (
      typeof ref === "object" &&
      ref !== null &&
      "name" in ref &&
      typeof (ref as { name?: unknown }).name === "string"
    ) {
      return (ref as { name: string }).name
    }
    return ""
  }

  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState("")
  const [success, setSuccess] = useState(false)
  const [titleWarning, setTitleWarning] = useState("")

  // Form state — pre-filled from book
  const [title, setTitle] = useState(book.title)
  const [subtitle, setSubtitle] = useState(book.subtitle ?? "")
  const [description, setDescription] = useState(book.description ?? "")
  const [isbn, setIsbn] = useState(book.isbn ?? "")
  const [publisherId, setPublisherId] = useState(getRefId(book.publisherId))
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    (book.categoryIds ?? []).map((c) => getRefId(c)).filter(Boolean)
  )
  const [basePrice, setBasePrice] = useState(String(book.basePrice))
  const [currency, setCurrency] = useState(book.currency ?? "VND")
  const [language, setLanguage] = useState(book.language ?? "vi")
  const [publishDate, setPublishDate] = useState(
    book.publishDate ? book.publishDate.slice(0, 10) : ""
  )
  const [pageCount, setPageCount] = useState(book.pageCount ? String(book.pageCount) : "")
  const [tags, setTags] = useState((book.tags ?? []).join(", "))
  const [status, setStatus] = useState(String(book.status ?? 1))

  // Stock info
  const [stockQuantity, setStockQuantity] = useState(
    book.stock?.quantity != null ? String(book.stock.quantity) : ""
  )
  const [stockLocation, setStockLocation] = useState(book.stock?.location ?? "")

  // Image management
  const [existingImages] = useState(
    (book.images ?? [])
      .filter((img) => img != null)
      .map((img) =>
        typeof img === "object" ? img : { _id: String(img), url: "" }
      )
  )
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([])
  const [newImages, setNewImages] = useState<UploadedBookImage[]>([])

  // Cover image upload
  const [newCoverImage, setNewCoverImage] = useState<UploadedBookImage | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(book.thumbnailUrl ?? null)
  const [uploadingImages, setUploadingImages] = useState(false)

  // Publisher search (single-select)
  const [publisherOpen, setPublisherOpen] = useState(false)
  const [publisherSearch, setPublisherSearch] = useState("")
  const [publishers, setPublishers] = useState<Supplier[]>([])
  const [publisherName, setPublisherName] = useState(getRefName(book.publisherId))
  const debouncedPublisherSearch = useDebounce(publisherSearch, 400)

  // Author search (multi-select)
  const [authorOpen, setAuthorOpen] = useState(false)
  const [authorSearch, setAuthorSearch] = useState("")
  const [authorResults, setAuthorResults] = useState<Author[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<{ _id: string; name: string }[]>(
    (book.authors ?? [])
      .map((a) => ({ _id: getRefId(a), name: getRefName(a) || getRefId(a) }))
      .filter((a) => Boolean(a._id))
  )
  const debouncedAuthorSearch = useDebounce(authorSearch, 400)
  const debouncedTitle = useDebounce(title, 500)

  // Category search (multi-select)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const isIsbnValid = /^(?:\d{9}[\dX]|\d{13})$/.test(isbn.trim()) || isbn.trim() === ""

  const setFieldError = (name: string, message: string) => {
    setErrors((prev) => ({ ...prev, [name]: message }))
  }

  const clearFieldError = (name: string) => {
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const scrollToFirstError = (fieldErrors: Record<string, string>) => {
    const order = [
      "title",
      "isbn",
      "pageCount",
      "publishDate",
      "tags",
      "basePrice",
      "publisherId",
      "authors",
      "categoryIds",
      "images",
      "stockQuantity",
      "stockLocation",
    ]

    const anchorMap: Record<string, string> = {
      publisherId: "publisher-section",
      authors: "authors-section",
      categoryIds: "categories-section",
      images: "images-section",
    }

    const firstField = order.find((name) => fieldErrors[name]) || Object.keys(fieldErrors)[0]
    if (!firstField) return

    const targetId = anchorMap[firstField] || firstField
    setTimeout(() => {
      const target = document.getElementById(targetId)
      if (!target) return
      target.scrollIntoView({ behavior: "smooth", block: "center" })
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        target.focus()
      }
    }, 0)
  }

  const fetchCategories = useCallback(async () => {
    try {
      const res = await CategoryApiRequest.getCategories({ limit: 50 })
      if (res && res.payload.success) {
        const data = res.payload.data as any
        setCategories(data.items ?? data ?? [])
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Fetch publishers on search change
  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const res = await SupplierApiRequest.getSuppliers({
          q: debouncedPublisherSearch || undefined,
          limit: 20,
        })
        if (res && res.payload.success) {
          const data = res.payload.data as any
          setPublishers(data.items ?? data ?? [])
        }
      } catch {
        // ignore
      }
    }
    fetchPublishers()
  }, [debouncedPublisherSearch])

  // Fetch authors on search change
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await AuthorApiRequest.getAuthors({
          q: debouncedAuthorSearch || undefined,
          limit: 20,
        })
        if (res && res.payload.success) {
          const data = res.payload.data as any
          setAuthorResults(data.items ?? data ?? [])
        }
      } catch {
        // ignore
      }
    }
    fetchAuthors()
  }, [debouncedAuthorSearch])

  useEffect(() => {
    const checkDuplicateTitle = async () => {
      const normalized = debouncedTitle.trim().toLowerCase()
      if (!normalized || normalized === book.title.trim().toLowerCase()) {
        setTitleWarning("")
        return
      }

      try {
        const res = await BookApiRequest.adminGetBooks("", {
          q: debouncedTitle.trim(),
          limit: 10,
        })

        if (!res?.payload?.success) {
          setTitleWarning("")
          return
        }

        const data = res.payload.data as { items?: Array<{ _id?: string; title?: string }> }
        const duplicate = (data.items ?? []).some(
          (item) =>
            item._id !== book._id &&
            (item.title ?? "").trim().toLowerCase() === normalized
        )

        setTitleWarning(duplicate ? "Tieu de nay co the gay trung slug voi sach khac" : "")
      } catch {
        setTitleWarning("")
      }
    }

    checkDuplicateTitle()
  }, [debouncedTitle, book._id, book.title])

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    )
    clearFieldError("categoryIds")
  }

  const uploadBookImageNow = async (file: File): Promise<UploadedBookImage | null> => {
    const res = await MediaApiRequest.uploadBookImage(file)
    if (res?.payload?.success && res.payload.data?._id && res.payload.data?.url) {
      return { _id: res.payload.data._id, url: res.payload.data.url }
    }
    return null
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImages(true)
    setGlobalError("")
    try {
      const uploaded = await uploadBookImageNow(file)
      if (!uploaded) {
        setFieldError("images", "Upload ảnh bìa thất bại")
        return
      }
      setNewCoverImage(uploaded)
      setCoverPreview(uploaded.url)
      clearFieldError("images")
    } catch (error: any) {
      setFieldError("images", error?.payload?.message || error?.message || "Upload ảnh bìa thất bại")
    } finally {
      setUploadingImages(false)
      e.target.value = ""
    }
  }

  const handleNewImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainSlots = Math.max(0, 10 - newImages.length)
    const filesToUpload = files.slice(0, remainSlots)
    if (filesToUpload.length === 0) {
      e.target.value = ""
      return
    }

    setUploadingImages(true)
    setGlobalError("")
    try {
      const uploadedItems: UploadedBookImage[] = []
      for (const file of filesToUpload) {
        const uploaded = await uploadBookImageNow(file)
        if (uploaded) uploadedItems.push(uploaded)
      }

      if (uploadedItems.length === 0) {
        setFieldError("images", "Upload ảnh bổ sung thất bại")
        return
      }

      setNewImages((prev) => [...prev, ...uploadedItems].slice(0, 10))
      clearFieldError("images")
    } catch (error: any) {
      setFieldError("images", error?.payload?.message || error?.message || "Upload ảnh bổ sung thất bại")
    } finally {
      setUploadingImages(false)
      e.target.value = ""
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    clearFieldError("images")
  }

  const markExistingImageForRemoval = (imgId: string) => {
    setRemoveImageIds((prev) =>
      prev.includes(imgId) ? prev.filter((id) => id !== imgId) : [...prev, imgId]
    )
  }

  const handleSubmit = async () => {
    setErrors({})
    setGlobalError("")
    setSuccess(false)

    // Validate form — required fields always passed, optional fields use undefined when empty
    const formValues: UpdateBookFormInput = {
      title,
      subtitle: subtitle || undefined,
      description: description || undefined,
      isbn: isbn || undefined,
      publisherId,
      categoryIds: selectedCategoryIds,
      basePrice: Number(basePrice) || 0,
      currency: currency || undefined,
      language: language || undefined,
      publishDate: publishDate || undefined,
      pageCount: pageCount ? Number(pageCount) : undefined,
      tags: tags || undefined,
      stockQuantity: Number(stockQuantity) || 0,
    }

    const result = updateBookFormSchema.safeParse(formValues)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message
        }
      })
      setErrors(fieldErrors)
      scrollToFirstError(fieldErrors)
      return
    }

    setLoading(true)

    try {
      const addImageIds = [
        ...(newCoverImage ? [newCoverImage._id] : []),
        ...newImages.map((img) => img._id),
      ]
      const newThumbnailUrl = newCoverImage?.url ?? ""

      // Build request body — only send changed fields
      const body: UpdateBookRequest = {
        basePrice: Number(basePrice),
        stockQuantity: Number(stockQuantity),
      }

      if (title !== book.title) body.title = title.trim()
      if (subtitle !== (book.subtitle ?? "")) body.subtitle = subtitle.trim() || undefined
      if (description !== (book.description ?? "")) body.description = description.trim() || undefined
      if (isbn !== (book.isbn ?? "")) body.isbn = isbn.trim() || undefined

      const origPublisherId = getRefId(book.publisherId)
      if (publisherId !== origPublisherId) body.publisherId = publisherId

      const origCatIds = (book.categoryIds ?? []).map((c) => getRefId(c)).filter(Boolean)
      if (JSON.stringify(selectedCategoryIds.sort()) !== JSON.stringify(origCatIds.sort())) {
        body.categoryIds = selectedCategoryIds
      }

      if (currency !== (book.currency ?? "VND")) body.currency = currency
      if (language !== (book.language ?? "vi")) body.language = language

      const origPublishDate = book.publishDate ? book.publishDate.slice(0, 10) : ""
      if (publishDate !== origPublishDate) body.publishDate = publishDate || undefined

      if (Number(pageCount || 0) !== (book.pageCount ?? 0))
        body.pageCount = pageCount ? Number(pageCount) : undefined

      const origTags = (book.tags ?? []).join(", ")
      if (tags !== origTags)
        body.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)

      if (Number(status) !== (book.status ?? 1)) body.status = Number(status)

      if (addImageIds.length > 0) body.addImages = addImageIds
      if (removeImageIds.length > 0) body.removeImages = removeImageIds
      if (newThumbnailUrl) body.thumbnailUrl = newThumbnailUrl

      // Authors change detection
      const origAuthorIds = (book.authors ?? [])
        .map((a) => getRefId(a))
        .filter(Boolean)
        .sort()
      const newAuthorIds = selectedAuthors.map((a) => a._id).sort()
      if (JSON.stringify(newAuthorIds) !== JSON.stringify(origAuthorIds)) {
        body.authors = selectedAuthors.map((a) => a._id)
      }

      // Stock change detection
      const origStockLocation = book.stock?.location ?? ""
      if (stockLocation !== origStockLocation) {
        body.stockLocation = stockLocation
      }

      // Check if anything changed
      if (Object.keys(body).length === 0) {
        setGlobalError("No changes to save")
        setLoading(false)
        return
      }

      await BookApiRequest.adminUpdate("", book._id, body)

      setSuccess(true)
      toast.success("Cap nhat sach thanh cong")
      setTimeout(() => {
        router.push(`/admin/books/${book._id}`)
      }, 1500)
    } catch (error: any) {
      // Extract validation details from multiple backend error shapes
      const details: BackendValidationDetail[] =
        error?.payload?.data?.details ||
        error?.payload?.details ||
        error?.data?.details ||
        error?.details ||
        []

      if (Array.isArray(details) && details.length > 0) {
        const fieldErrors: Record<string, string> = {}
        const errorMessages: string[] = []

        details.forEach((d) => {
          const message = d.message || "Du lieu khong hop le"
          const normalizedField = normalizeBackendField(d.field)

          if (normalizedField) {
            if (!fieldErrors[normalizedField]) {
              fieldErrors[normalizedField] = message
            }
          } else {
            errorMessages.push(message)
          }
        })

        setErrors(fieldErrors)
        setGlobalError(errorMessages.join("\n"))
        scrollToFirstError(fieldErrors)
      } else {
        const message =
          error?.payload?.message || error?.message || "An error occurred"
        setGlobalError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="text-sm text-destructive mt-1">{errors[name]}</p>
    ) : null

  return (
    <div className="space-y-6">
      {/* Global error */}
      {globalError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {globalError.includes("\n") ? (
              <ul className="list-disc list-inside space-y-1">
                {globalError.split("\n").map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            ) : (
              globalError
            )}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Book updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
          <CardDescription>Update basic book information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Book title</Label>
              <Input
                id="title"
                placeholder="Enter book title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  clearFieldError("title")
                }}
              />
              <FieldError name="title" />
              {titleWarning && !errors.title && (
                <p className="text-sm text-amber-600">{titleWarning}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <div className="relative">
                <Input
                  id="isbn"
                  placeholder="9781234567890"
                  value={isbn}
                  onChange={(e) => {
                    setIsbn(e.target.value)
                    clearFieldError("isbn")
                  }}
                  className={isIsbnValid && isbn.trim() ? "pr-10" : undefined}
                />
                {isIsbnValid && isbn.trim() && (
                  <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-green-600" />
                )}
              </div>
              <FieldError name="isbn" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Phụ đề</Label>
            <Input
              id="subtitle"
              placeholder="Enter subtitle (optional)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Describe the book content..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Giá bán</Label>
              <Input
                id="basePrice"
                type="number"
                placeholder="450000"
                value={basePrice}
                onChange={(e) => {
                  setBasePrice(e.target.value)
                  clearFieldError("basePrice")
                }}
              />
              <FieldError name="basePrice" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Loại tiền</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CNY">CNY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Ngôn ngữ</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pageCount">Số trang</Label>
              <Input
                id="pageCount"
                type="number"
                placeholder="320"
                value={pageCount}
                onChange={(e) => {
                  setPageCount(e.target.value)
                  clearFieldError("pageCount")
                }}
              />
              <FieldError name="pageCount" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishDate">Ngày xuất bản</Label>
              <Input
                id="publishDate"
                type="date"
                value={publishDate}
                onChange={(e) => {
                  setPublishDate(e.target.value)
                  clearFieldError("publishDate")
                }}
              />
              <FieldError name="publishDate" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
              <Input
                id="tags"
                placeholder="programming, clean-code"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value)
                  clearFieldError("tags")
                }}
              />
              <FieldError name="tags" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Change book status</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BookStatusMap).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Publisher */}
      <Card>
        <div id="publisher-section" />
        <CardHeader>
          <CardTitle>Nhà xuất bản</CardTitle>
          <CardDescription>Search and select publisher</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Nhà xuất bản</Label>
          <Popover open={publisherOpen} onOpenChange={setPublisherOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={publisherOpen}
                className="w-full justify-between font-normal"
              >
                {publisherId ? publisherName || publisherId : "Select publisher..."}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search publisher..."
                  value={publisherSearch}
                  onValueChange={setPublisherSearch}
                />
                <CommandList>
                  <CommandEmpty>No publisher found</CommandEmpty>
                  <CommandGroup>
                    {publishers.map((pub) => (
                      <CommandItem
                        key={pub._id}
                        value={pub._id}
                        onSelect={() => {
                          setPublisherId(pub._id)
                          setPublisherName(pub.name)
                          setPublisherOpen(false)
                          clearFieldError("publisherId")
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            publisherId === pub._id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {pub.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FieldError name="publisherId" />
        </CardContent>
      </Card>

      {/* Authors */}
      <Card>
        <div id="authors-section" />
        <CardHeader>
          <CardTitle>Tác giả</CardTitle>
          <CardDescription>Search and select authors for the book</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Tác giả</Label>
          <Popover open={authorOpen} onOpenChange={setAuthorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={authorOpen}
                className="w-full justify-between font-normal"
              >
                {selectedAuthors.length > 0
                  ? `Selected ${selectedAuthors.length} tác giả`
                  : "Select authors..."}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search authors..."
                  value={authorSearch}
                  onValueChange={setAuthorSearch}
                />
                <CommandList>
                  <CommandEmpty>No authors found</CommandEmpty>
                  <CommandGroup>
                    {authorResults.map((author) => {
                      const isSelected = selectedAuthors.some((a) => a._id === author._id)
                      return (
                        <CommandItem
                          key={author._id}
                          value={author._id}
                          onSelect={() => {
                            setSelectedAuthors((prev) =>
                              isSelected
                                ? prev.filter((a) => a._id !== author._id)
                                : [...prev, { _id: author._id, name: author.name }]
                            )
                            clearFieldError("authors")
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {author.name}
                          {author.penName && (
                            <span className="ml-1 text-muted-foreground">
                              ({author.penName})
                            </span>
                          )}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedAuthors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedAuthors.map((author) => (
                <Badge key={author._id} variant="secondary" className="gap-1 pr-1">
                  {author.name}
                  <button
                    type="button"
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedAuthors((prev) =>
                        prev.filter((a) => a._id !== author._id)
                      )
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <FieldError name="authors" />
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <div id="categories-section" />
        <CardHeader>
          <CardTitle>Category</CardTitle>
          <CardDescription>Search and select categories for the book</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Category</Label>
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={categoryOpen}
                className="w-full justify-between font-normal"
              >
                {selectedCategoryIds.length > 0
                  ? `Selected ${selectedCategoryIds.length} danh mục`
                  : "Select categories..."}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search categories..."
                  value={categorySearch}
                  onValueChange={setCategorySearch}
                />
                <CommandList>
                  <CommandEmpty>No categories found</CommandEmpty>
                  <CommandGroup>
                    {filteredCategories.map((cat) => {
                      const isSelected = selectedCategoryIds.includes(cat._id)
                      return (
                        <CommandItem
                          key={cat._id}
                          value={cat._id}
                          onSelect={() => toggleCategory(cat._id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {cat.name}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedCategoryIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategoryIds.map((catId) => {
                const cat = categories.find((c) => c._id === catId)
                return (
                  <Badge key={catId} variant="secondary" className="gap-1 pr-1">
                    {cat?.name ?? catId}
                    <button
                      type="button"
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedCategoryIds((prev) => prev.filter((id) => id !== catId))
                      }}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}
          <FieldError name="categoryIds" />
        </CardContent>
      </Card>

      {/* Stock / Warehouse */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory information</CardTitle>
          <CardDescription>Stock quantity and storage location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Số lượng tồn kho *</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => {
                  setStockQuantity(e.target.value)
                  clearFieldError("stockQuantity")
                }}
                placeholder="0"
              />
              <FieldError name="stockQuantity" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockLocation">Vị trí kho</Label>
              <Input
                id="stockLocation"
                value={stockLocation}
                onChange={(e) => {
                  setStockLocation(e.target.value)
                  clearFieldError("stockLocation")
                }}
                placeholder="Ví dụ: Kệ A3, Tầng 2"
              />
              <FieldError name="stockLocation" />
            </div>
          </div>
          {book.stock && (
            <p className="text-xs text-muted-foreground">
              Status: {book.stock.status === "available" ? "Còn hàng" : book.stock.status}
              {book.stock.lastUpdated && (
                <> · Last updated: {new Date(book.stock.lastUpdated).toLocaleDateString("vi-VN")}</>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <div id="images-section" />
        <CardHeader>
          <CardTitle>Hình ảnh</CardTitle>
          <CardDescription>Manage cover and book images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cover image */}
          <div className="space-y-2">
            <Label>Ảnh bìa</Label>
            <div className="flex items-center gap-4">
              {coverPreview ? (
                <div className="relative size-32 rounded-lg border bg-muted">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="size-full rounded-lg object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 size-6"
                    onClick={() => {
                      setNewCoverImage(null)
                      setCoverPreview(book.thumbnailUrl ?? null)
                      clearFieldError("images")
                    }}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <label className="flex size-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-muted">
                  <Upload className="size-8 text-muted-foreground" />
                  <span className="mt-2 text-xs text-muted-foreground">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
              )}
            </div>
            <FieldError name="images" />
          </div>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label>Ảnh hiện tại</Label>
              <div className="grid grid-cols-5 gap-4">
                {existingImages.map((img) => (
                  <div
                    key={img._id}
                    className={`relative aspect-square rounded-lg border bg-muted ${
                      removeImageIds.includes(img._id)
                        ? "opacity-40 ring-2 ring-destructive"
                        : ""
                    }`}
                  >
                    {img.url && (
                      <img
                        src={img.url}
                        alt="Book image"
                        className="size-full rounded-lg object-cover"
                      />
                    )}
                    <Button
                      variant={
                        removeImageIds.includes(img._id)
                          ? "outline"
                          : "destructive"
                      }
                      size="icon"
                      className="absolute -top-2 -right-2 size-6"
                      onClick={() => markExistingImageForRemoval(img._id)}
                    >
                      {removeImageIds.includes(img._id) ? "↩" : "×"}
                    </Button>
                  </div>
                ))}
              </div>
              {removeImageIds.length > 0 && (
                <p className="text-sm text-destructive">
                  {removeImageIds.length} image(s) will be removed when saved
                </p>
              )}
              <FieldError name="images" />
            </div>
          )}

          {/* New additional images */}
          <div className="space-y-2">
            <Label>Add ảnh mới</Label>
            <div className="grid grid-cols-5 gap-4">
              {newImages.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg border bg-muted"
                >
                  <img
                    src={img.url}
                    alt={`New ${index + 1}`}
                    className="size-full rounded-lg object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 size-6"
                    onClick={() => removeNewImage(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {newImages.length < 10 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-muted">
                  <Upload className="size-6 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleNewImagesUpload}
                  />
                </label>
              )}
            </div>
            <FieldError name="images" />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/books/${book._id}`)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading || uploadingImages}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Updating...
            </>
          ) : uploadingImages ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Đang upload ảnh...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
