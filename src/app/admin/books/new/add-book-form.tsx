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
import { createBookFormSchema, type CreateBookFormInput } from "@/validation/book-schemas"
import type { CreateBookRequest } from "@/types/book"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"

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
    categoryId: "categoryIds",
    categories: "categoryIds",
    imageIds: "images",
    addImages: "images",
    removeImages: "images",
    authorIds: "authors",
    stockQuantity: "initialQuantity",
  }

  return map[field] ?? field
}

export function AddBookForm() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState("")
  const [success, setSuccess] = useState(false)
  const [titleWarning, setTitleWarning] = useState("")

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
  const [coverImage, setCoverImage] = useState<UploadedBookImage | null>(null)
  const [additionalImages, setAdditionalImages] = useState<UploadedBookImage[]>([])
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
  const debouncedTitle = useDebounce(title, 500)

  // Category search (multi-select)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")

  const isTitleValid = title.trim().length >= 2
  const isIsbnValid = /^(?:\d{9}[\dX]|\d{13})$/.test(isbn.trim())
  const isBasePriceValid = Number(basePrice) > 0

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
      "initialQuantity",
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
      if (!normalized) {
        setTitleWarning("")
        return
      }

      try {
        const res = await BookApiRequest.adminGetBooks("", {
          q: debouncedTitle.trim(),
          limit: 5,
        })

        if (!res?.payload?.success) {
          setTitleWarning("")
          return
        }

        const data = res.payload.data as { items?: Array<{ title?: string }> }
        const duplicate = (data.items ?? []).some((item) => (item.title ?? "").trim().toLowerCase() === normalized)

        setTitleWarning(duplicate ? "This book seems to already exist." : "")
      } catch {
        setTitleWarning("")
      }
    }

    checkDuplicateTitle()
  }, [debouncedTitle])

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
      setCoverImage(uploaded)
      clearFieldError("images")
    } catch (error: any) {
      setFieldError("images", error?.payload?.message || error?.message || "Upload ảnh bìa thất bại")
    } finally {
      setUploadingImages(false)
      e.target.value = ""
    }
  }

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainSlots = Math.max(0, 10 - additionalImages.length)
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

      setAdditionalImages((prev) => [...prev, ...uploadedItems].slice(0, 10))
      clearFieldError("images")
    } catch (error: any) {
      setFieldError("images", error?.payload?.message || error?.message || "Upload ảnh bổ sung thất bại")
    } finally {
      setUploadingImages(false)
      e.target.value = ""
    }
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index))
    clearFieldError("images")
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
      initialQuantity: Number(initialQuantity) || 0,
      stockLocation: stockLocation || undefined,
    }

    const result = createBookFormSchema.safeParse(formValues)
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

    if (titleWarning) {
      const confirmed = window.confirm("This book already exists. Do you still want to add it?")
      if (!confirmed) {
        return
      }
    }

    setLoading(true)

    try {
      const imageIds = [
        ...(coverImage ? [coverImage._id] : []),
        ...additionalImages.map((img) => img._id),
      ]
      const thumbnailUrl = coverImage?.url ?? ""

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
      body.initialQuantity = Number(initialQuantity)
      if (stockLocation.trim()) body.stockLocation = stockLocation.trim()
      if (imageIds.length > 0) body.images = imageIds
      if (thumbnailUrl) body.thumbnailUrl = thumbnailUrl
      if (selectedAuthors.length > 0) body.authors = selectedAuthors.map((a) => a._id)

      await BookApiRequest.adminCreate("", body)

      setSuccess(true)
      toast.success("Tao sach thanh cong")
      setTimeout(() => {
        router.push("/admin/books")
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
          const message = d.message || "Dữ liệu không hợp lệ"
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
    errors[name] ? <p className="text-sm text-destructive mt-1">{errors[name]}</p> : null

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
          <AlertDescription>Book created successfully! Redirecting...</AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
          <CardDescription>Enter basic book information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Book title *</Label>
              <div className="relative">
                <Input
                  id="title"
                  placeholder="Enter book title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    clearFieldError("title")
                  }}
                  className={isTitleValid ? "pr-10" : undefined}
                />
                {isTitleValid && (
                  <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-green-600" />
                )}
              </div>
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
                  placeholder="9781234567890 (10 hoặc 13 chữ số)"
                  value={isbn}
                  onChange={(e) => {
                    setIsbn(e.target.value)
                    clearFieldError("isbn")
                  }}
                  className={isIsbnValid ? "pr-10" : undefined}
                />
                {isIsbnValid && (
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
              <Label htmlFor="basePrice">Giá bán (VND) *</Label>
              <div className="relative">
                <Input
                  id="basePrice"
                  type="number"
                  placeholder="450000"
                  value={basePrice}
                  onChange={(e) => {
                    setBasePrice(e.target.value)
                    clearFieldError("basePrice")
                  }}
                  className={isBasePriceValid ? "pr-10" : undefined}
                />
                {isBasePriceValid && (
                  <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-green-600" />
                )}
              </div>
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
                placeholder="programming, clean-code, design"
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

      {/* Publisher */}
      <Card>
        <div id="publisher-section" />
        <CardHeader>
          <CardTitle>Nhà xuất bản *</CardTitle>
          <CardDescription>Search and select publisher</CardDescription>
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
          <CardTitle>Category *</CardTitle>
          <CardDescription>Search and select at least 1 category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Category *</Label>
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

      {/* Images */}
      <Card>
        <div id="images-section" />
        <CardHeader>
          <CardTitle>Hình ảnh</CardTitle>
          <CardDescription>Upload cover and book images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ảnh bìa</Label>
            <div className="flex items-center gap-4">
              {coverImage?.url ? (
                <div className="relative size-32 rounded-lg border bg-muted">
                  <img
                    src={coverImage.url}
                    alt="Cover preview"
                    className="size-full rounded-lg object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 size-6"
                    onClick={() => {
                      setCoverImage(null)
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
            <FieldError name="images" />
          </div>

          <div className="space-y-2">
            <Label>Ảnh bổ sung</Label>
            <div className="grid grid-cols-5 gap-4">
              {additionalImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg border bg-muted">
                  <img
                    src={img.url}
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
            <FieldError name="images" />
          </div>
        </CardContent>
      </Card>

      {/* Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Kho hàng</CardTitle>
          <CardDescription>Initial stock information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="initialQuantity">Số lượng ban đầu *</Label>
              <Input
                id="initialQuantity"
                type="number"
                placeholder="100"
                value={initialQuantity}
                onChange={(e) => {
                  setInitialQuantity(e.target.value)
                  clearFieldError("initialQuantity")
                }}
              />
              <FieldError name="initialQuantity" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockLocation">Vị trí kho</Label>
              <Input
                id="stockLocation"
                placeholder="MAIN"
                value={stockLocation}
                onChange={(e) => {
                  setStockLocation(e.target.value)
                  clearFieldError("stockLocation")
                }}
              />
              <FieldError name="stockLocation" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/books")} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading || uploadingImages}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating book...
            </>
          ) : uploadingImages ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Đang upload ảnh...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Create book
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

