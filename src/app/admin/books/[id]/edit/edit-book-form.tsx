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
import { MediaType, MediaFolder } from "@/types/media"
import { updateBookFormSchema, type UpdateBookFormInput } from "@/validation/book-schemas"
import type { AdminBook, UpdateBookRequest } from "@/types/book"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

const BookStatusMap: Record<number, string> = {
  0: "Ngừng bán",
  1: "Đang bán",
  2: "Ẩn",
  3: "Bản nháp",
  4: "Hết hàng",
}

export function EditBookForm({ book }: { book: AdminBook }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form state — pre-filled from book
  const [title, setTitle] = useState(book.title)
  const [subtitle, setSubtitle] = useState(book.subtitle ?? "")
  const [description, setDescription] = useState(book.description ?? "")
  const [isbn, setIsbn] = useState(book.isbn ?? "")
  const [publisherId, setPublisherId] = useState(
    typeof book.publisherId === "object" ? book.publisherId._id : (book.publisherId ?? "")
  )
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    (book.categoryIds ?? []).map((c) => (typeof c === "object" ? c._id : String(c)))
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
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  // Cover image upload
  const [newCoverImage, setNewCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(book.thumbnailUrl ?? null)
  const [uploadingImages, setUploadingImages] = useState(false)

  // Publisher search (single-select)
  const [publisherOpen, setPublisherOpen] = useState(false)
  const [publisherSearch, setPublisherSearch] = useState("")
  const [publishers, setPublishers] = useState<Supplier[]>([])
  const [publisherName, setPublisherName] = useState(
    typeof book.publisherId === "object" ? book.publisherId.name : ""
  )
  const debouncedPublisherSearch = useDebounce(publisherSearch, 400)

  // Author search (multi-select)
  const [authorOpen, setAuthorOpen] = useState(false)
  const [authorSearch, setAuthorSearch] = useState("")
  const [authorResults, setAuthorResults] = useState<Author[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<{ _id: string; name: string }[]>(
    (book.authors ?? []).map((a) =>
      typeof a === "object" ? { _id: a._id, name: a.name } : { _id: String(a), name: String(a) }
    )
  )
  const debouncedAuthorSearch = useDebounce(authorSearch, 400)

  // Category search (multi-select)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")

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

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    )
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewCoverImage(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleNewImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const combined = [...newImages, ...files].slice(0, 10)
    setNewImages(combined)
    setNewImagePreviews(combined.map((f) => URL.createObjectURL(f)))
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const markExistingImageForRemoval = (imgId: string) => {
    setRemoveImageIds((prev) =>
      prev.includes(imgId) ? prev.filter((id) => id !== imgId) : [...prev, imgId]
    )
  }

  const uploadNewImages = async (): Promise<{
    addImageIds: string[]
    newThumbnailUrl: string
  }> => {
    const addImageIds: string[] = []
    let newThumbnailUrl = ""

    // Upload new cover image
    if (newCoverImage) {
      const res = await MediaApiRequest.upload(newCoverImage, {
        type: MediaType.IMAGE,
        folder: MediaFolder.BOOK,
      })
      if (res && res.payload.success) {
        const media = res.payload.data as any
        addImageIds.push(media._id)
        newThumbnailUrl = media.url
      }
    }

    // Upload additional new images
    for (const file of newImages) {
      const res = await MediaApiRequest.upload(file, {
        type: MediaType.IMAGE,
        folder: MediaFolder.BOOK,
      })
      if (res && res.payload.success) {
        const media = res.payload.data as any
        addImageIds.push(media._id)
      }
    }

    return { addImageIds, newThumbnailUrl }
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
      return
    }

    setLoading(true)

    try {
      // Upload new images if any
      let addImageIds: string[] = []
      let newThumbnailUrl = ""

      if (newCoverImage || newImages.length > 0) {
        setUploadingImages(true)
        const uploadResult = await uploadNewImages()
        addImageIds = uploadResult.addImageIds
        newThumbnailUrl = uploadResult.newThumbnailUrl
        setUploadingImages(false)
      }

      // Build request body — only send changed fields
      const body: UpdateBookRequest = {}

      if (title !== book.title) body.title = title.trim()
      if (subtitle !== (book.subtitle ?? "")) body.subtitle = subtitle.trim() || undefined
      if (description !== (book.description ?? "")) body.description = description.trim() || undefined
      if (isbn !== (book.isbn ?? "")) body.isbn = isbn.trim() || undefined

      const origPublisherId =
        typeof book.publisherId === "object" ? book.publisherId._id : (book.publisherId ?? "")
      if (publisherId !== origPublisherId) body.publisherId = publisherId

      const origCatIds = (book.categoryIds ?? []).map((c) =>
        typeof c === "object" ? c._id : String(c)
      )
      if (JSON.stringify(selectedCategoryIds.sort()) !== JSON.stringify(origCatIds.sort())) {
        body.categoryIds = selectedCategoryIds
      }

      if (Number(basePrice) !== book.basePrice) body.basePrice = Number(basePrice)
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
        .map((a) => (typeof a === "object" ? a._id : String(a)))
        .sort()
      const newAuthorIds = selectedAuthors.map((a) => a._id).sort()
      if (JSON.stringify(newAuthorIds) !== JSON.stringify(origAuthorIds)) {
        body.authors = selectedAuthors.map((a) => a._id)
      }

      // Stock change detection
      const origStockQty = book.stock?.quantity != null ? String(book.stock.quantity) : ""
      if (stockQuantity !== origStockQty) {
        body.stockQuantity = stockQuantity ? Number(stockQuantity) : 0
      }
      const origStockLocation = book.stock?.location ?? ""
      if (stockLocation !== origStockLocation) {
        body.stockLocation = stockLocation
      }

      // Check if anything changed
      if (Object.keys(body).length === 0) {
        setGlobalError("Không có thay đổi nào để lưu")
        setLoading(false)
        return
      }

      await BookApiRequest.adminUpdate("", book._id, body)

      setSuccess(true)
      setTimeout(() => {
        router.push(`/admin/books/${book._id}`)
      }, 1500)
    } catch (error: any) {
      // Extract validation details from various error shapes
      const details: { field?: string; message: string }[] =
        error?.payload?.data?.details ||
        error?.data?.details ||
        []

      if (Array.isArray(details) && details.length > 0) {
        // Map known fields to inline FieldError
        const fieldErrors: Record<string, string> = {}
        const errorMessages: string[] = []

        details.forEach((d: any) => {
          if (d.field) {
            fieldErrors[d.field] = d.message
            errorMessages.push(`${d.field}: ${d.message}`)
          } else if (d.message) {
            errorMessages.push(d.message)
          }
        })

        setErrors(fieldErrors)
        setGlobalError(errorMessages.join("\n"))
      } else {
        const message =
          error?.payload?.message || error?.message || "Có lỗi xảy ra"
        setGlobalError(message)
      }
    } finally {
      setLoading(false)
      setUploadingImages(false)
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
          <AlertTitle>Lỗi</AlertTitle>
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
          <AlertTitle>Thành công</AlertTitle>
          <AlertDescription>
            Sách đã được cập nhật! Đang chuyển hướng...
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Cập nhật thông tin cơ bản về sách</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Tên sách</Label>
              <Input
                id="title"
                placeholder="Nhập tên sách"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <FieldError name="title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                placeholder="9781234567890"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
              <FieldError name="isbn" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Phụ đề</Label>
            <Input
              id="subtitle"
              placeholder="Nhập phụ đề (tùy chọn)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả nội dung sách..."
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
                onChange={(e) => setBasePrice(e.target.value)}
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
                onChange={(e) => setPageCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishDate">Ngày xuất bản</Label>
              <Input
                id="publishDate"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
              <Input
                id="tags"
                placeholder="programming, clean-code"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái</CardTitle>
          <CardDescription>Thay đổi trạng thái sách</CardDescription>
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
        <CardHeader>
          <CardTitle>Nhà xuất bản</CardTitle>
          <CardDescription>Tìm kiếm và chọn nhà xuất bản</CardDescription>
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
                {publisherId ? publisherName || publisherId : "Chọn nhà xuất bản..."}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Tìm nhà xuất bản..."
                  value={publisherSearch}
                  onValueChange={setPublisherSearch}
                />
                <CommandList>
                  <CommandEmpty>Không tìm thấy nhà xuất bản</CommandEmpty>
                  <CommandGroup>
                    {publishers.map((pub) => (
                      <CommandItem
                        key={pub._id}
                        value={pub._id}
                        onSelect={() => {
                          setPublisherId(pub._id)
                          setPublisherName(pub.name)
                          setPublisherOpen(false)
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
        <CardHeader>
          <CardTitle>Tác giả</CardTitle>
          <CardDescription>Tìm kiếm và chọn tác giả cho sách</CardDescription>
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
                  ? `Đã chọn ${selectedAuthors.length} tác giả`
                  : "Chọn tác giả..."}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Tìm tác giả..."
                  value={authorSearch}
                  onValueChange={setAuthorSearch}
                />
                <CommandList>
                  <CommandEmpty>Không tìm thấy tác giả</CommandEmpty>
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
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Danh mục</CardTitle>
          <CardDescription>Tìm kiếm và chọn danh mục cho sách</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Danh mục</Label>
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={categoryOpen}
                className="w-full justify-between font-normal"
              >
                {selectedCategoryIds.length > 0
                  ? `Đã chọn ${selectedCategoryIds.length} danh mục`
                  : "Chọn danh mục..."}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Tìm danh mục..."
                  value={categorySearch}
                  onValueChange={setCategorySearch}
                />
                <CommandList>
                  <CommandEmpty>Không tìm thấy danh mục</CommandEmpty>
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
          <CardTitle>Thông tin kho</CardTitle>
          <CardDescription>Số lượng tồn kho và vị trí lưu trữ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Số lượng tồn kho</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
              />
              <FieldError name="stockQuantity" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockLocation">Vị trí kho</Label>
              <Input
                id="stockLocation"
                value={stockLocation}
                onChange={(e) => setStockLocation(e.target.value)}
                placeholder="Ví dụ: Kệ A3, Tầng 2"
              />
              <FieldError name="stockLocation" />
            </div>
          </div>
          {book.stock && (
            <p className="text-xs text-muted-foreground">
              Trạng thái: {book.stock.status === "available" ? "Còn hàng" : book.stock.status}
              {book.stock.lastUpdated && (
                <> · Cập nhật lần cuối: {new Date(book.stock.lastUpdated).toLocaleDateString("vi-VN")}</>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Hình ảnh</CardTitle>
          <CardDescription>Quản lý ảnh bìa và ảnh sách</CardDescription>
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
                      setCoverPreview(null)
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
                  {removeImageIds.length} ảnh sẽ bị xóa khi lưu
                </p>
              )}
            </div>
          )}

          {/* New additional images */}
          <div className="space-y-2">
            <Label>Thêm ảnh mới</Label>
            <div className="grid grid-cols-5 gap-4">
              {newImagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg border bg-muted"
                >
                  <img
                    src={preview}
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
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {uploadingImages ? "Đang upload ảnh..." : "Đang cập nhật..."}
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
