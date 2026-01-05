import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart } from "lucide-react"

interface BookCardProps {
  id?: number
  title: string
  author: string
  price: string
  originalPrice?: string
  rating: number
  reviews: number
  imageUrl: string
  badge?: string
}

export function BookCard({ id, title, author, price, originalPrice, rating, reviews, imageUrl, badge }: BookCardProps) {
  return (
    <Card className="overflow-hidden border border-border p-0">
      <Link href={`/book/${id || "1"}`}>
        <div className="relative aspect-[4/4] overflow-hidden bg-muted">
          {badge && <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600">{badge}</Badge>}
          <Image
            src={  "/book-default-cover.jpg"}
            // src={imageUrl || "/book-default-cover.jpg"}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      </Link>
      <CardContent className="p-4 pt-0 space-y-2">
        <Link href={`/book/${id || 1}`}>
          <h3 className="font-semibold line-clamp-2 text-balance h-12 overflow-hidden">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground truncate">{author}</p>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-sm text-muted-foreground">({reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{price}</span>
            {originalPrice && <span className="text-sm text-muted-foreground line-through">{originalPrice}</span>}
          </div>
        </div>
        <Button className="w-full" size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Thêm vào giỏ
        </Button>
      </CardContent>
    </Card>
  )
}