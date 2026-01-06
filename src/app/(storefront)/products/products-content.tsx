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
    id: 1,
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    price: "120.000đ",
    originalPrice: "150.000đ",
    rating: 4.8,
    reviews: 2500,
    imageUrl: "/alchemist-book-cover.png",
    badge: "-20%",
    category: "Văn học",
    language: "Tiếng Việt",
  },
  {
    id: 2,
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    price: "85.000đ",
    originalPrice: "105.000đ",
    rating: 4.9,
    reviews: 5000,
    imageUrl: "/how-to-win-friends-book.jpg",
    badge: "Bestseller",
    category: "Kỹ năng sống",
    language: "Tiếng Việt",
  },
  {
    id: 3,
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    author: "Rosie Nguyễn",
    price: "90.000đ",
    rating: 4.7,
    reviews: 3000,
    imageUrl: "/youth-motivation-book.jpg",
    category: "Kỹ năng sống",
    language: "Tiếng Việt",
  },
  {
    id: 4,
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro",
    price: "105.000đ",
    rating: 4.9,
    reviews: 4000,
    imageUrl: "/my-sweet-orange-tree-book.jpg",
    category: "Văn học",
    language: "Tiếng Việt",
  },
  {
    id: 5,
    title: "Thay Đổi Tí Hon",
    author: "James Clear",
    price: "160.000đ",
    rating: 4.8,
    reviews: 8000,
    imageUrl: "/atomic-habits-book.png",
    category: "Kỹ năng sống",
    language: "Tiếng Việt",
  },
  {
    id: 6,
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    price: "195.000đ",
    originalPrice: "220.000đ",
    rating: 4.9,
    reviews: 6000,
    imageUrl: "/sapiens-book-cover.png",
    category: "Lịch sử",
    language: "Tiếng Việt",
  },
  {
    id: 7,
    title: "Nghệ Thuật Bán Hàng",
    author: "Brian Tracy",
    price: "125.000đ",
    rating: 4.6,
    reviews: 2000,
    imageUrl: "/sales-book.jpg",
    category: "Kinh doanh",
    language: "Tiếng Việt",
  },
  {
    id: 8,
    title: "Tâm Lý Học Đám Đông",
    author: "Gustave Le Bon",
    price: "98.000đ",
    rating: 4.7,
    reviews: 3500,
    imageUrl: "/psychology-of-crowds-book.jpg",
    category: "Tâm lý",
    language: "Tiếng Việt",
  },
  {
    id: 9,
    title: "Người Thầy Cuối Cùng",
    author: "Mitch Albom",
    price: "78.000đ",
    rating: 4.8,
    reviews: 2800,
    imageUrl: "/tuesdays-with-morrie-book.jpg",
    category: "Văn học",
    language: "Tiếng Việt",
  },
  {
    id: 10,
    title: "Chiến Tranh Tiền Tệ",
    author: "Song Hongbing",
    price: "145.000đ",
    rating: 4.5,
    reviews: 1800,
    imageUrl: "/currency-wars-book.jpg",
    category: "Kinh tế",
    language: "Tiếng Việt",
  },
  {
    id: 11,
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    price: "175.000đ",
    rating: 4.9,
    reviews: 5500,
    imageUrl: "/thinking-fast-and-slow-book.jpg",
    category: "Tâm lý",
    language: "Tiếng Việt",
  },
  {
    id: 12,
    title: "Cafe Cùng Tony",
    author: "Tony Buổi Sáng",
    price: "88.000đ",
    rating: 4.6,
    reviews: 3200,
    imageUrl: "/cafe-book-vietnamese.jpg",
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
        const price = Number.parseInt(book.price.replace(/\D/g, ""))
        return price >= filters.priceRange.min && price <= filters.priceRange.max
      })
    }

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter((book) => book.rating >= filters.minRating)
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
        return Number.parseInt(a.price.replace(/\D/g, "")) - Number.parseInt(b.price.replace(/\D/g, ""))
      case "price-desc":
        return Number.parseInt(b.price.replace(/\D/g, "")) - Number.parseInt(a.price.replace(/\D/g, ""))
      case "rating":
        return b.rating - a.rating
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
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
