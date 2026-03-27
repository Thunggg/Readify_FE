"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "@/components/storefront/book-card";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";
import { BookApiRequest } from "@/api-request/book";
import { CartApiRequest } from "@/api-request/cart";
import { WishlistApiRequest } from "@/api-request/wishlist";
import { ReviewApiRequest } from "@/api-request/review";
import { BookReviews } from "./book-reviews";
import { PublicBook, PublicBookDetail } from "@/types/book";
import type { BookRatingSummary } from "@/types/review";
interface BookDetailContentProps {
  bookSlug: string;
}

const DEFAULT_COVER = "/book-default-cover.jpg";

/** Return the URL only when it looks valid; otherwise fall back to the default cover. */
function safeImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string" || !url.trim()) return DEFAULT_COVER;
  // Accept absolute http(s) URLs and local paths starting with "/"
  if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Try constructing a URL to validate it
  try {
    new URL(url);
    return url;
  } catch {
    return DEFAULT_COVER;
  }
}

export function BookDetailContent({ bookSlug }: BookDetailContentProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [book, setBook] = useState<PublicBookDetail | null>(null);
  const [ratingSummary, setRatingSummary] = useState<BookRatingSummary | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<PublicBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    if (!bookSlug) return;

    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [bookRes, relatedRes] = await Promise.all([
          BookApiRequest.getBySlug(bookSlug),
          BookApiRequest.getRelatedBySlug(bookSlug, 4),
        ]);

        if (!mounted) return;

        // book detail + review summary (same source as Reviews tab)
        if (bookRes && bookRes.status >= 200 && bookRes.status < 300) {
          const bookData = bookRes.payload.data as PublicBookDetail;
          setBook(bookData);
          setRatingSummary(null);
          if (bookData._id) {
            try {
              const summaryRes = await ReviewApiRequest.getBookRatingSummary(bookData._id);
              if (mounted && summaryRes?.payload?.success && summaryRes.payload.data) {
                setRatingSummary(summaryRes.payload.data);
              }
            } catch (summaryErr) {
              if (mounted) {
                console.error("Fetch book rating summary failed", summaryErr);
                setRatingSummary(null);
              }
            }
          }
        } else {
          setBook(null);
          setRatingSummary(null);
        }

        // related books
        if (relatedRes && relatedRes.status >= 200 && relatedRes.status < 300) {
          setRelatedBooks((relatedRes.payload.data as PublicBook[]) ?? []);
        } else {
          setRelatedBooks([]);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Fetch book data failed", err);
        setBook(null);
        setRelatedBooks([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [bookSlug]);

  const refreshRatingSummary = useCallback(async () => {
    if (!book?._id) return;
    try {
      const res = await ReviewApiRequest.getBookRatingSummary(book._id);
      if (res?.payload?.success && res.payload.data) {
        setRatingSummary(res.payload.data);
      }
    } catch (err) {
      console.error("Refresh rating summary failed", err);
    }
  }, [book?._id]);

  // Check if book is in wishlist when book loads
  useEffect(() => {
    if (!book?._id) return;

    const checkWishlist = async () => {
      try {
        const res = await WishlistApiRequest.checkBookInWishlist(book._id);
        if (res?.payload?.success) {
          setIsFavorite(res.payload.data.isInWishlist ?? false);
        }
      } catch (err) {
        console.error("Check wishlist failed", err);
      }
    };

    checkWishlist();
  }, [book?._id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = async () => {
    if (!book?._id) {
      console.error("Book ID not found");
      return;
    }

    try {
      setLoadingCart(true);
      console.log("Adding to cart:", { bookId: book._id, quantity });
      
      const res = await CartApiRequest.addToCart({
        bookId: book._id,
        quantity: quantity,
      });

      console.log("Add to cart response:", res);
      
      if (res && res.status >= 200 && res.status < 300) {
        alert(`Successfully added ${quantity} book(s) to cart!`);
        setQuantity(1); // Reset quantity after adding
      } else {
        alert("Failed to add to cart. Please try again.");
      }
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("Error adding to cart. Please try again.");
    } finally {
      setLoadingCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!book?._id) return;

    try {
      setLoadingWishlist(true);

      if (isFavorite) {
        // Remove from wishlist
        const res = await WishlistApiRequest.removeFromWishlist(book._id);
        if (res && res.status >= 200 && res.status < 300) {
          setIsFavorite(false);
          alert("Removed from wishlist");
        }
      } else {
        // Add to wishlist
        const res = await WishlistApiRequest.addToWishlist({
          bookId: book._id,
        });
        if (res && res.status >= 200 && res.status < 300) {
          setIsFavorite(true);
          alert("Added to wishlist");
        }
      }
    } catch (err) {
      console.error("Toggle wishlist failed", err);
      alert("Error updating wishlist. Please try again.");
    } finally {
      setLoadingWishlist(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!book) {
    return <div className="container mx-auto px-4 py-8">Book not found</div>;
  }

  function formatPrice(value?: number | string | null) {
    if (value === null || value === undefined) return "0 ₫";

    // nếu là string, cố parse thành số
    const num =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[^\d.-]/g, ""));

    if (!Number.isFinite(num)) return "0 ₫";

    return num.toLocaleString("vi-VN") + " ₫";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className="transition-colors hover:text-foreground"
        >
          Products
        </Link>
        <span>/</span>
        {book.categoryIds?.[0] && (
          <>
            <Link
              href={`/category/${book.categoryIds[0].slug}`}
              className="transition-colors hover:text-foreground"
            >
              {book.categoryIds[0].name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{book.title}</span>
      </nav>

      {/* Product Detail */}
      <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
        {/* Image Section */}
        <div className="lg:col-span-2">
          <div className="sticky top-8 space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] bg-muted">
                  <Image
                    src={safeImageUrl(
                      book.images?.[selectedImage]?.url ||
                      book.thumbnailUrl
                    )}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Gallery Thumbnails */}
            {book.images && book.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {book.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <Image
                      src={safeImageUrl(image.url)}
                      alt={`${book.title} image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6 lg:col-span-3">
          {/* Title & Category */}
          <div>
            {book.categoryIds?.[0] && (
              <Badge className="mb-3">{book.categoryIds[0].name}</Badge>
            )}
            <h1 className="mb-2 text-3xl font-bold text-balance md:text-4xl">
              {book.title}
            </h1>
            {book.authors && book.authors.length > 0 && (
              <p className="text-lg text-muted-foreground">
                Author:{" "}
                <span className="font-medium text-foreground">
                  {book.authors.map((a) => a.name).join(", ")}
                </span>
              </p>
            )}
            {book.publisherId && (
              <p className="text-lg text-muted-foreground">
                Publisher:{" "}
                <span className="font-medium text-foreground">
                  {book.publisherId.name}
                </span>
              </p>
            )}
          </div>

          {/* Rating — aligned with GET /reviews/book/:id/summary (approved reviews) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i <
                      Math.floor(
                        ratingSummary?.ratingAvg ?? book.averageRating ?? 0,
                      )
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">
                {(ratingSummary?.ratingAvg ?? book.averageRating ?? 0).toFixed(1)}
              </span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground">
              {(ratingSummary?.ratingCount ?? book.totalReviews ?? 0).toLocaleString()}{" "}
              reviews
            </span>
            {book.soldCount !== undefined && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-sm text-muted-foreground">
                  {book.soldCount.toLocaleString()} sold
                </span>
              </>
            )}
          </div>

          {/* Price */}
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(book.basePrice)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">VAT included</p>
            </CardContent>
          </Card>

          {/* Stock Status */}
          {book.isInStock !== undefined && (
            <div>
              {book.isInStock ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  In Stock
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  Out of Stock
                </Badge>
              )}
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center rounded-lg border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1"
                disabled={loadingCart}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {loadingCart ? "Adding..." : "Add to cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
                disabled={loadingWishlist}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Truck className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Free shipping</p>
                  {/* <p className="text-xs text-muted-foreground">
                    Orders over 200,000₫
                  </p> */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Authentic product</p>
                  <p className="text-xs text-muted-foreground">
                    100% genuine source
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <RotateCcw className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Easy returns</p>
                  <p className="text-xs text-muted-foreground">Within 7 days</p>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>

      <Card className="mb-12 shadow-sm rounded-xl overflow-hidden border-none bg-card/60 backdrop-blur-sm">
        <CardContent className="p-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="mb-8 p-1 bg-muted/30 rounded-xl grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="description" className="rounded-lg py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">Book description</TabsTrigger>
              <TabsTrigger value="specs" className="rounded-lg py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">Specifications</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
                Reviews
                <Badge variant="outline" className="h-5 px-1.5 py-0 min-w-[1.25rem] flex items-center justify-center bg-primary/10 border-primary/20 text-primary text-[10px]">
                  {book.totalReviews || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {book.description && (
                <div>
                  <h3 className="mb-3 text-xl font-semibold">Book overview</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {book.description}
                  </p>
                </div>
              )}

              {book.tags && book.tags.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xl font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {book.authors && book.authors.length > 0 && (
                  <div className="flex justify-between border-b py-3">
                    <span className="text-muted-foreground">Author(s)</span>
                    <span className="font-medium">
                      {book.authors.map((a) => a.name).join(", ")}
                    </span>
                  </div>
                )}
                {book.publisherId && (
                  <div className="flex justify-between border-b py-3">
                    <span className="text-muted-foreground">Publisher</span>
                    <span className="font-medium">{book.publisherId.name}</span>
                  </div>
                )}
                {book.publishDate && (
                  <div className="flex justify-between border-b py-3">
                    <span className="text-muted-foreground">
                      Publication Date
                    </span>
                    <span className="font-medium">
                      {new Date(book.publishDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
                {book.pageCount && (
                  <div className="flex justify-between border-b py-3">
                    <span className="text-muted-foreground">Pages</span>
                    <span className="font-medium">{book.pageCount} pages</span>
                  </div>
                )}
                {book.language && (
                  <div className="flex justify-between border-b py-3">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">{book.language}</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex justify-between border-b py-3">
                    <span className="text-muted-foreground">ISBN</span>
                    <span className="font-medium">{book.isbn}</span>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {book?._id && (
                <BookReviews
                  bookId={book._id}
                  onRatingSummaryUpdated={refreshRatingSummary}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Related Products */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Related products</h2>
          <Button variant="link" asChild>
            <Link href="/products">View all</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {relatedBooks.map((book) => (
            <BookCard key={book.slug} {...book} />
          ))}
        </div>
      </div>
    </div>
  );
}
