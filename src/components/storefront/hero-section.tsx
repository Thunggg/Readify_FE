"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const banners = [
  {
    id: 1,
    title: "Discover the world through books",
    description:
      "Classic literature and bestsellers are waiting for you. Open a new door to knowledge every day.",
    badge: "JUST UPDATED",
    image: "/wooden-bookshelf-library.jpg",
    buttonText: "Explore now",
    buttonLink: "/products",
  },
  {
    id: 2,
    title: "Business & Economics",
    description: "A collection of business, marketing, and personal growth books from world-renowned authors.",
    badge: "FEATURED CATEGORY",
    image: "/business-books-collection.jpg",
    buttonText: "See more",
    buttonLink: "/category/kinh-te",
  },
  {
    id: 3,
    title: "Vietnamese Literature",
    description: "Experience the beauty of Vietnamese literature through outstanding classic and modern works.",
    badge: "VIETNAMESE LIT",
    image: "/vietnamese-literature.jpg",
    buttonText: "Explore now",
    buttonLink: "/category/van-hoc",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const currentBanner = banners[currentSlide]

  return (
    <section className="container py-8">
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main Banner Carousel */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-linear-to-r from-amber-900/90 to-amber-800/80 border-0 group">
          <div className="absolute inset-0 opacity-30">
            <Image
              src={currentBanner.image || "/placeholder.svg"}
              alt="Banner"
              fill
              className="object-cover transition-transform duration-500"
              sizes="(min-width: 1024px) 66vw, 100vw"
            />
          </div>
          <div className="relative p-8 lg:p-12 text-white min-h-[400px] flex flex-col justify-between">
            <div>
              <div className="inline-block mb-4 px-3 py-1 bg-blue-600 rounded-full text-sm font-medium">
                {currentBanner.badge}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-balance">{currentBanner.title}</h1>
              <p className="text-lg mb-6 max-w-xl text-pretty text-white/90">{currentBanner.description}</p>
              <Button size="lg" asChild className="bg-white text-black hover:bg-white/90">
                <Link href={currentBanner.buttonLink}>{currentBanner.buttonText}</Link>
              </Button>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Side Cards */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1 bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900 p-6">
            <div className="flex items-start justify-between h-full">
              <div>
                <h3 className="text-xl font-bold mb-2 text-pink-900 dark:text-pink-100">Children&apos;s Books</h3>
                <p className="text-pink-800 dark:text-pink-200 mb-3">A curated collection for young readers</p>
                <Button
                  variant="link"
                  asChild
                  className="text-pink-700 dark:text-pink-300 p-0 h-auto font-semibold"
                >
                  <Link href="/category/thieu-nhi">
                    View details <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="w-16 h-20 bg-pink-200 dark:bg-pink-900 rounded flex items-center justify-center">
                <Image
                  src="/children-book-cover.png"
                  alt="Book"
                  width={64}
                  height={80}
                  className="object-cover rounded"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            </div>
          </Card>

          <Card className="flex-1 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900 p-6">
            <div className="flex items-start justify-between h-full">
              <div>
                <h3 className="text-xl font-bold mb-2 text-cyan-900 dark:text-cyan-100">Business & Economics</h3>
                <p className="text-cyan-800 dark:text-cyan-200 mb-3">Top picks for entrepreneurs</p>
                <Button
                  variant="link"
                  asChild
                  className="text-cyan-700 dark:text-cyan-300 p-0 h-auto font-semibold"
                >
                  <Link href="/category/kinh-te">
                    Explore <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="w-16 h-20 bg-cyan-200 dark:bg-cyan-900 rounded flex items-center justify-center">
                <Image
                  src="/business-book-cover.png"
                  alt="Book"
                  width={64}
                  height={80}
                  className="object-cover rounded"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
