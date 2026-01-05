import { BookCard } from "@/components/storefront/book-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
        {/* {featuredBooks.map((book, index) => (
          <BookCard key={index} {...book} />
        ))} */}
      </div>
    </section>
  )
}
