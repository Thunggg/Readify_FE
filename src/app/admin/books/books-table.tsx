"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { BookApiRequest } from "@/api-request/book"
import { CategoryApiRequest, type Category } from "@/api-request/category"
import type { AdminBook, SearchAdminBooksParams } from "@/types/book"
import type { PaginationMeta } from "@/types/api"
import { useDebounce } from "@/hooks/use-debounce"
import { handleErrorApi } from "@/lib/utils"

const BookStatusMap: Record<number, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  0: { label: "Ngừng bán", variant: "destructive" },
  1: { label: "Đang bán", variant: "default" },
  3: { label: "Bản nháp", variant: "secondary" },
  4: { label: "Hết hàng", variant: "destructive" },
}

type SortField = "title" | "basePrice" | "soldCount" | "createdAt"
type SortOrder = "asc" | "desc"

export function BooksTable({ deletedOnly = false }: { deletedOnly?: boolean }) {
  const [books, setBooks] = useState<AdminBook[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const itemsPerPage = 10

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params: SearchAdminBooksParams = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
        order: sortOrder,
      }

      if (deletedOnly) params.isDeleted = true

      if (debouncedSearch) params.q = debouncedSearch
      if (statusFilter !== "all") params.status = Number(statusFilter)
      if (categoryFilter !== "all") params.categoryId = categoryFilter

      const res = await BookApiRequest.adminGetBooks("", params)
      if (!res) return
      const payload = res.payload

      if (payload.success) {
        setBooks((payload.data?.items as AdminBook[]) ?? [])
        setMeta(payload.data?.meta ?? null)
      }
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, sortField, sortOrder, debouncedSearch, statusFilter, categoryFilter, deletedOnly])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await CategoryApiRequest.getCategories({ limit: 50 })
      if (!res) return
      const payload = res.payload
      if (payload.success) {
        const data = payload.data as any
        setCategories(data.items ?? data ?? [])
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter, categoryFilter])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    setActionLoading(true)
    try {
      await BookApiRequest.adminDelete("", id)
      setDeleteBookId(null)
      fetchBooks()
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRestore = async (id: string) => {
    setActionLoading(true)
    try {
      await BookApiRequest.adminRestore("", id)
      fetchBooks()
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setActionLoading(false)
    }
  }

  const totalPages = meta?.totalPages ?? 1

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 size-3" />
    return sortOrder === "asc" ? <ArrowUp className="ml-1 size-3" /> : <ArrowDown className="ml-1 size-3" />
  }

  const formatPrice = (price: number, currency?: string) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(price)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên sách, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={deletedOnly}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="1">Đang bán</SelectItem>
                <SelectItem value="3">Bản nháp</SelectItem>
                <SelectItem value="0">Ngừng bán</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
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
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("title")} className="h-8 px-2">
                  Tên sách
                  <SortIcon field="title" />
                </Button>
              </TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort("basePrice")} className="h-8 px-2">
                  Giá
                  <SortIcon field="basePrice" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort("soldCount")} className="h-8 px-2">
                  Đã bán
                  <SortIcon field="soldCount" />
                </Button>
              </TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không tìm thấy sách nào
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book._id} className={book.isDeleted ? "opacity-50" : ""}>
                  <TableCell>
                    {book.thumbnailUrl ? (
                      <img
                        src={book.thumbnailUrl}
                        alt={book.title}
                        className="size-12 rounded border object-cover"
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded border bg-muted text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="font-medium truncate">{book.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{book.slug}</div>
                  </TableCell>
                  <TableCell>
                    {book.categoryIds && book.categoryIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {book.categoryIds.slice(0, 2).map((cat) => (
                          <Badge key={typeof cat === "object" ? cat._id : cat} variant="outline" className="text-xs">
                            {typeof cat === "object" ? cat.name : cat}
                          </Badge>
                        ))}
                        {book.categoryIds.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{book.categoryIds.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatPrice(book.basePrice, book.currency)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{book.soldCount ?? 0}</Badge>
                  </TableCell>
                  <TableCell>
                    {book.isDeleted ? (
                      <Badge variant="destructive">Đã xóa</Badge>
                    ) : (
                      <Badge variant={BookStatusMap[book.status ?? 1]?.variant ?? "secondary"}>
                        {BookStatusMap[book.status ?? 1]?.label ?? "N/A"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionLoading}>
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/books/${book._id}`}>
                            <Eye className="mr-2 size-4" />
                            Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
                        {!book.isDeleted && !deletedOnly && (
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/books/${book._id}/edit`}>
                              <Pencil className="mr-2 size-4" />
                              Chỉnh sửa
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {book.isDeleted || deletedOnly ? (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                              handleRestore(book._id)
                            }}
                          >
                            <RotateCcw className="mr-2 size-4" />
                            Khôi phục
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => {
                              e.preventDefault()
                              setDeleteBookId(book._id)
                            }}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Xóa
                          </DropdownMenuItem>
                        )}
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
            ? `Hiển thị ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, meta.total)} trên ${meta.total} sách`
            : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            Trước
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number
              if (totalPages <= 5) {
                page = i + 1
              } else if (currentPage <= 3) {
                page = i + 1
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i
              } else {
                page = currentPage - 2 + i
              }
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="size-8 p-0"
                  disabled={loading}
                >
                  {page}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            Sau
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteBookId} onOpenChange={() => setDeleteBookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sách</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBookId && handleDelete(deleteBookId)}
              className="bg-destructive"
              disabled={actionLoading}
            >
              {actionLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
