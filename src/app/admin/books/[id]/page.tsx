import { SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Package, DollarSign, BookOpen, Warehouse, MapPin, Trash2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BookApiRequest } from "@/api-request/book"
import { cookies } from "next/headers"
import type { AdminBook } from "@/types/book"
import { DeleteBookButton } from "@/components/admin/books/delete-book-button"

const BookStatusMap: Record<number, string> = {
  0: "Discontinued",
  1: "On sale",
  3: "Draft",
  4: "Out of stock",
}

const LanguageMap: Record<string, string> = {
  vi: "Tiếng Việt",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value ?? ""

  let book: AdminBook

  try {
    const res = await BookApiRequest.adminGetById(accessToken, id)
    if (!res || !res.payload.success) {
      notFound()
    }
    book = res.payload.data as AdminBook
  } catch {
    notFound()
  }

  const formatPrice = (price: number, currency?: string) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(price)

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/books">Book Management</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{book.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
            <p className="text-muted-foreground">{book.slug}</p>
          </div>
          <div className="flex gap-2">
            {!book.isDeleted && (
              <Button variant="outline" asChild>
                <Link href={`/admin/books/${book._id}/edit`}>
                  <Pencil className="mr-2 size-4" />
                  Edit
                </Link>
              </Button>
            )}
            {!book.isDeleted && (
              <DeleteBookButton
                bookId={book._id}
                trigger={
                  <Button variant="destructive">
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left column - Cover image */}
          <Card>
            <CardContent className="p-6">
              {book.thumbnailUrl ? (
                <img
                  src={book.thumbnailUrl}
                  alt={book.title}
                  className="w-full rounded-lg border object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border bg-muted">
                  <span className="text-muted-foreground">Chưa có ảnh bìa</span>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <Badge
                  variant={
                    book.isDeleted
                      ? "destructive"
                      : book.status === 1
                        ? "default"
                        : "secondary"
                  }
                  className="w-full justify-center"
                >
                  {book.isDeleted
                    ? "Deleted"
                    : (BookStatusMap[book.status ?? 1] ?? "N/A")}
                </Badge>

                {book.images && book.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    {book.images
                      .filter((img): img is { _id: string; url: string } => img != null && typeof img === "object")
                      .map((img) => (
                        <img
                          key={img._id}
                          src={img.url}
                          alt="Preview"
                          className="rounded border object-cover aspect-square"
                        />
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right column - Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Giá bán</CardTitle>
                  <DollarSign className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(book.basePrice, book.currency)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tồn kho</CardTitle>
                  <Warehouse className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {book.stock?.quantity ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {book.stock
                      ? book.stock.status === "available"
                        ? "Còn hàng"
                        : book.stock.status === "reserved"
                          ? "Đã đặt trước"
                          : book.stock.status
                      : "Not stocked yet"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đã bán</CardTitle>
                  <Package className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {book.soldCount ?? 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Số trang</CardTitle>
                  <BookOpen className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {book.pageCount ?? "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {LanguageMap[book.language ?? ""] ?? book.language ?? "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stock / Warehouse info */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory information</CardTitle>
                <CardDescription>Inventory and storage location</CardDescription>
              </CardHeader>
              <CardContent>
                {book.stock ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Số lượng tồn kho</p>
                      <p className="text-sm font-semibold">{book.stock.quantity}</p>
                    </div>
                    {book.stock.location && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Vị trí kho</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-muted-foreground" />
                          <p className="text-sm">{book.stock.location}</p>
                        </div>
                      </div>
                    )}
                    {book.stock.price != null && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Cost price</p>
                        <p className="text-sm">{formatPrice(book.stock.price, book.currency)}</p>
                      </div>
                    )}
                    {book.stock.batch && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Lô hàng</p>
                        <p className="text-sm font-mono">{book.stock.batch}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Status kho</p>
                      <Badge variant={book.stock.status === "available" ? "default" : "secondary"}>
                        {book.stock.status === "available"
                          ? "Còn hàng"
                          : book.stock.status === "reserved"
                            ? "Đã đặt trước"
                            : book.stock.status}
                      </Badge>
                    </div>
                    {book.stock.lastUpdated && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Last stock update</p>
                        <p className="text-sm">
                          {new Date(book.stock.lastUpdated).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No stock information yet. This book has not been stocked.</p>
                )}
              </CardContent>
            </Card>

            {/* Book information */}
            <Card>
              <CardHeader>
                <CardTitle>Book information</CardTitle>
                <CardDescription>Book details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {book.isbn && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        ISBN
                      </p>
                      <p className="text-sm font-mono">{book.isbn}</p>
                    </div>
                  )}
                  {book.subtitle && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Phụ đề
                      </p>
                      <p className="text-sm">{book.subtitle}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {book.categoryIds?.map((cat) => (
                        <Badge
                          key={
                            typeof cat === "object" ? cat._id : String(cat)
                          }
                          variant="outline"
                        >
                          {typeof cat === "object" ? cat.name : String(cat)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {book.publisherId && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Nhà xuất bản
                      </p>
                      <p className="text-sm">
                        {typeof book.publisherId === "object"
                          ? book.publisherId.name
                          : String(book.publisherId)}
                      </p>
                    </div>
                  )}
                  {book.publishDate && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Ngày xuất bản
                      </p>
                      <p className="text-sm">
                        {new Date(book.publishDate).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Created at
                    </p>
                    <p className="text-sm">
                      {new Date(book.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authors */}
            {book.authors && book.authors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tác giả</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {book.authors.map((author) => (
                      <Badge
                        key={
                          typeof author === "object"
                            ? author._id
                            : String(author)
                        }
                        variant="secondary"
                      >
                        {typeof author === "object"
                          ? author.name
                          : String(author)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {book.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Mô tả</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
