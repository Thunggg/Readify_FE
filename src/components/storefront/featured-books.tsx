import { BookCard } from "@/components/storefront/book-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const featuredBooks = [
  {
    title: "To use CSS variables for theming set tailwind.cssVariables to true in your components.json file.",
    author: "Paulo Coelho",
    price: "120.000đ",
    originalPrice: "180.000đ",
    rating: 4.8,
    reviews: 2500,
    imageUrl: "/the-alchemist-book-cover-desert-pyramids.jpg",
    badge: "-33%",
  },
  {
    title: "How to Win Friends",
    author: "Dale Carnegie",
    price: "85.000đ",
    originalPrice: "",
    rating: 4.9,
    reviews: 5000,
    imageUrl: "/how-to-win-friends-influence-people-book-cover-gol.jpg",
  },
  {
    title: "Your Worth at Youth",
    author: "Rosie Nguyen",
    price: "90.000đ",
    originalPrice: "",
    rating: 4.7,
    reviews: 3200,
    imageUrl: "/youth-motivation-book-cover-blue.jpg",
    badge: "Bestseller",
  },
  {
    title: "My Sweet Orange Tree",
    author: "José Mauro",
    price: "105.000đ",
    originalPrice: "",
    rating: 4.9,
    reviews: 4400,
    imageUrl: "/orange-tree-book-cover-illustration.jpg",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: "160.000đ",
    originalPrice: "",
    rating: 4.8,
    reviews: 8000,
    imageUrl: "/atomic-habits-book-cover-dark-minimalist.jpg",
  },
]

export function FeaturedBooks() {
  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Featured Books</h2>
          <p className="text-muted-foreground">Most loved books of the week</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {featuredBooks.map((book, index) => (
          <BookCard key={index} {...book} />
        ))}
      </div>
    </section>
  )
}
