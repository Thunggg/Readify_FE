"use client"

import { useState } from "react"
import { BookCard } from "@/components/storefront/book-card"
import { ProductFilters } from "./product-filters"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal, LayoutGrid, List } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const books = [
  {
    _id: "1",
    slug: "nha-gia-kim",
    title: "Nhà Giả Kim",
    authors: ["Paulo Coelho"],
    basePrice: 120000,
    originalPrice: 150000,
    currency: "VND",
    rating: 4.8,
    reviews: 2500,
    thumbnailUrl: "/alchemist-book-cover.png",
    badge: "-20%",
    category: "Văn học",
    language: "Tiếng Việt",
  },
  {
    _id: "2",
    slug: "dac-nhan-tam",
    title: "Đắc Nhân Tâm",
    authors: ["Dale Carnegie"],
    basePrice: 85000,
    originalPrice: 105000,
    currency: "VND",
    rating: 4.9,
    reviews: 5000,
    thumbnailUrl: "/how-to-win-friends-book.jpg",
    badge: "Bestseller",
    category: "Kỹ năng sống",
    language: "Tiếng Việt",
  },
  {
    _id: "3",
    slug: "tuoi-tre-dang-gia-bao-nhieu",
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    authors: ["Rosie Nguyễn"],
    basePrice: 90000,
    currency: "VND",
    rating: 4.7,
    reviews: 3000,
    thumbnailUrl: "/youth-motivation-book.jpg",
    category: "Kỹ năng sống",
    language: "Tiếng Việt",
  },
  {
    _id: "4",
    slug: "cay-cam-ngot-cua-toi",
    title: "Cây Cam Ngọt Của Tôi",
    authors: ["José Mauro"],
    basePrice: 105000,
    currency: "VND",
    rating: 4.9,
    reviews: 4000,
    thumbnailUrl: "/my-sweet-orange-tree-book.jpg",
    category: "Văn học",
    language: "Tiếng Việt",
  },
  {
    _id: "5",
    slug: "thay-doi-ti-hon",
    title: "Thay Đổi Tí Hon",
    authors: ["James Clear"],
    basePrice: 160000,
    currency: "VND",
    rating: 4.8,
    reviews: 8000,
    thumbnailUrl: "/atomic-habits-book.png",
    category: "Kỹ năng sống",
    language: "Tiếng Việt",
  },
  {
    _id: "6",
    slug: "sapiens-luoc-su-loai-nguoi",
    title: "Sapiens: Lược Sử Loài Người",
    authors: ["Yuval Noah Harari"],
    basePrice: 195000,
    originalPrice: 220000,
    currency: "VND",
    rating: 4.9,
    reviews: 6000,
    thumbnailUrl: "/sapiens-book-cover.png",
    category: "Lịch sử",
    language: "Tiếng Việt",
  },
  {
    _id: "7",
    slug: "nghe-thuat-ban-hang",
    title: "Nghệ Thuật Bán Hàng",
    authors: ["Brian Tracy"],
    basePrice: 125000,
    currency: "VND",
    rating: 4.6,
    reviews: 2000,
    thumbnailUrl: "/sales-book.jpg",
    category: "Kinh doanh",
    language: "Tiếng Việt",
  },
  {
    _id: "8",
    slug: "tam-ly-hoc-dam-dong",
    title: "Tâm Lý Học Đám Đông",
    authors: ["Gustave Le Bon"],
    basePrice: 98000,
    currency: "VND",
    rating: 4.7,
    reviews: 3500,
    thumbnailUrl: "/psychology-of-crowds-book.jpg",
    category: "Tâm lý",
    language: "Tiếng Việt",
  },
  {
    _id: "9",
    slug: "nguoi-thay-cuoi-cung",
    title: "Người Thầy Cuối Cùng",
    authors: ["Mitch Albom"],
    basePrice: 78000,
    currency: "VND",
    rating: 4.8,
    reviews: 2800,
    thumbnailUrl: "/tuesdays-with-morrie-book.jpg",
    category: "Văn học",
    language: "Tiếng Việt",
  },
  {
    _id: "10",
    slug: "chien-tranh-tien-te",
    title: "Chiến Tranh Tiền Tệ",
    authors: ["Song Hongbing"],
    basePrice: 145000,
    currency: "VND",
    rating: 4.5,
    reviews: 1800,
    thumbnailUrl: "/currency-wars-book.jpg",
    category: "Kinh tế",
    language: "Tiếng Việt",
  },
  {
    _id: "11",
    slug: "tu-duy-nhanh-va-cham",
    title: "Tư Duy Nhanh Và Chậm",
    authors: ["Daniel Kahneman"],
    basePrice: 175000,
    currency: "VND",
    rating: 4.9,
    reviews: 5500,
    thumbnailUrl: "/thinking-fast-and-slow-book.jpg",
    category: "Tâm lý",
    language: "Tiếng Việt",
  },
  {
    _id: "12",
    slug: "cafe-cung-tony",
    title: "Cafe Cùng Tony",
    authors: ["Tony Buổi Sáng"],
    basePrice: 88000,
    currency: "VND",
    rating: 4.6,
    reviews: 3200,
    thumbnailUrl: "/cafe-book-vietnamese.jpg",
    category: "Kỹ năng sống",
    language: "Tiếng Việt",
  },
]

export function ProductsContent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("popular")
  const [filteredBooks, setFilteredBooks] = useState(books)

  const handleFilterChange = (filters: any) => {
    let filtered = [...books]

    // Filter by category
    if (filters.categories.length > 0) {
      filtered = filtered.filter((book) => filters.categories.includes(book.category))
    }

    // Filter by price range
    if (filters.priceRange.min > 0 || filters.priceRange.max < 500000) {
      filtered = filtered.filter((book) => {
        const price = book.basePrice
        return price >= filters.priceRange.min && price <= filters.priceRange.max
      })
    }

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter((book) => (book.rating || 0) >= filters.minRating)
    }

    // Filter by language
    if (filters.languages.length > 0) {
      filtered = filtered.filter((book) => filters.languages.includes(book.language))
    }

    setFilteredBooks(filtered)
  }

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.basePrice - b.basePrice
      case "price-desc":
        return b.basePrice - a.basePrice
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "name":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tất cả sản phẩm</h1>
        <p className="text-muted-foreground">Khám phá toàn bộ bộ sưu tập sách của chúng tôi</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters - Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <ProductFilters onFilterChange={handleFilterChange} />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <div className="py-4">
                    <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
                    <ProductFilters onFilterChange={handleFilterChange} />
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-semibold text-foreground">{sortedBooks.length}</span> sản phẩm
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Sort Select */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Phổ biến nhất</SelectItem>
                  <SelectItem value="rating">Đánh giá cao</SelectItem>
                  <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {sortedBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn</p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {sortedBooks.map((book) => (
                <BookCard key={book._id} {...book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
