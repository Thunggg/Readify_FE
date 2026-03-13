"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { createBookFormSchema, type CreateBookFormInput } from "@/validation/book-schemas"
import type { CreateBookRequest } from "@/types/book"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

export function AddBookForm() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [isbn, setIsbn] = useState("")
  const [publisherId, setPublisherId] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [basePrice, setBasePrice] = useState("")
  const [currency, setCurrency] = useState("VND")
  const [language, setLanguage] = useState("vi")
  const [publishDate, setPublishDate] = useState("")
  const [pageCount, setPageCount] = useState("")
  const [tags, setTags] = useState("")
  const [initialQuantity, setInitialQuantity] = useState("")
  const [stockLocation, setStockLocation] = useState("")

  // Image upload
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // Publisher search (single-select)
  const [publisherOpen, setPublisherOpen] = useState(false)
  const [publisherSearch, setPublisherSearch] = useState("")
  const [publishers, setPublishers] = useState<Supplier[]>([])
  const [publisherName, setPublisherName] = useState("")
  const debouncedPublisherSearch = useDebounce(publisherSearch, 400)

  // Author search (multi-select)
  const [authorOpen, setAuthorOpen] = useState(false)
  const [authorSearch, setAuthorSearch] = useState("")
  const [authorResults, setAuthorResults] = useState<Author[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<{ _id: string; name: string }[]>([])
  const debouncedAuthorSearch = useDebounce(authorSearch, 400)

  // Category search (multi-select)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")

  const fetchCategories = useCallback(async () => {
    try {
      const res = await CategoryApiRequest.getCategories({ limit: 50 })
      if (res.payload.success) {
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
        if (res.payload.success) {
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
        if (res.payload.success) {
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
      setCoverImage(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFiles = [...additionalImages, ...files].slice(0, 10)
    setAdditionalImages(newFiles)
    setAdditionalPreviews(newFiles.map((f) => URL.createObjectURL(f)))
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index))
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<{ imageIds: string[]; thumbnailUrl: string }> => {
    const imageIds: string[] = []
    let thumbnailUrl = ""

    // Upload cover image first
    if (coverImage) {
      const res = await MediaApiRequest.upload(coverImage, {
        type: MediaType.IMAGE,
        folder: MediaFolder.BOOK,
      })
      if (res.payload.success) {
        const media = res.payload.data as any
        imageIds.push(media._id)
        thumbnailUrl = media.url
      }
    }

    // Upload additional images
    for (const file of additionalImages) {
      const res = await MediaApiRequest.upload(file, {
        type: MediaType.IMAGE,
        folder: MediaFolder.BOOK,
      })
      if (res.payload.success) {
        const media = res.payload.data as any
        imageIds.push(media._id)
      }
    }

    return { imageIds, thumbnailUrl }
  }

  const handleSubmit = async () => {
    setErrors({})
    setGlobalError("")
    setSuccess(false)

    // Validate form
    const formValues: CreateBookFormInput = {
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
      initialQuantity: initialQuantity ? Number(initialQuantity) : undefined,
      stockLocation: stockLocation || undefined,
    }

    const result = createBookFormSchema.safeParse(formValues)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
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
      // Upload images first
      let imageIds: string[] = []
      let thumbnailUrl = ""

      if (coverImage || additionalImages.length > 0) {
        setUploadingImages(true)
        const uploadResult = await uploadImages()
        imageIds = uploadResult.imageIds
        thumbnailUrl = uploadResult.thumbnailUrl
        setUploadingImages(false)
      }

      // Build request body
      const body: CreateBookRequest = {
        title: title.trim(),
        publisherId,
        categoryIds: selectedCategoryIds,
        basePrice: Number(basePrice),
      }

      if (subtitle.trim()) body.subtitle = subtitle.trim()
      if (description.trim()) body.description = description.trim()
      if (isbn.trim()) body.isbn = isbn.trim()
      if (currency) body.currency = currency
      if (language) body.language = language
      if (publishDate) body.publishDate = publishDate
      if (pageCount) body.pageCount = Number(pageCount)
      if (tags.trim()) body.tags = tags.split(",").map((t) => t.trim()).filter(Boolean)
      if (initialQuantity) body.initialQuantity = Number(initialQuantity)
      if (stockLocation.trim()) body.stockLocation = stockLocation.trim()
      if (imageIds.length > 0) body.images = imageIds
      if (thumbnailUrl) body.thumbnailUrl = thumbnailUrl
      if (selectedAuthors.length > 0) body.authors = selectedAuthors.map((a) => a._id)

      await BookApiRequest.adminCreate("", body)

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin/books")
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
    errors[name] ? <p className="text-sm text-destructive mt-1">{errors[name]}</p> : null

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
          <AlertDescription>Sách đã được tạo thành công! Đang chuyển hướng...</AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>Nhập thông tin cơ bản về sách</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Tên sách *</Label>
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
                placeholder="9781234567890 (10 hoặc 13 chữ số)"
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
              <Label htmlFor="basePrice">Giá bán (VND) *</Label>
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
                placeholder="programming, clean-code, design"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publisher */}
      <Card>
        <CardHeader>
          <CardTitle>Nhà xuất bản *</CardTitle>
          <CardDescription>Tìm kiếm và chọn nhà xuất bản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Nhà xuất bản *</Label>
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
          <CardTitle>Danh mục *</CardTitle>
          <CardDescription>Tìm kiếm và chọn ít nhất 1 danh mục cho sách</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Danh mục *</Label>
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

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Hình ảnh</CardTitle>
          <CardDescription>Upload ảnh bìa và ảnh sách</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                      setCoverImage(null)
                      setCoverPreview(null)
                    }}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <label className="flex size-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-muted">
                  <Upload className="size-8 text-muted-foreground" />
                  <span className="mt-2 text-xs text-muted-foreground">Upload</span>
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

          <div className="space-y-2">
            <Label>Ảnh bổ sung</Label>
            <div className="grid grid-cols-5 gap-4">
              {additionalPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg border bg-muted">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="size-full rounded-lg object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 size-6"
                    onClick={() => removeAdditionalImage(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {additionalImages.length < 10 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-muted">
                  <Upload className="size-6 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAdditionalImagesUpload}
                  />
                </label>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Kho hàng</CardTitle>
          <CardDescription>Thông tin số lượng ban đầu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="initialQuantity">Số lượng ban đầu</Label>
              <Input
                id="initialQuantity"
                type="number"
                placeholder="100"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockLocation">Vị trí kho</Label>
              <Input
                id="stockLocation"
                placeholder="MAIN"
                value={stockLocation}
                onChange={(e) => setStockLocation(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/books")} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {uploadingImages ? "Đang upload ảnh..." : "Đang tạo sách..."}
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Tạo sách
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
