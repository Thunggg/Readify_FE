"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface FilterState {
  categories: string[]
  priceRange: { min: number; max: number }
  minRating: number
  languages: string[]
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: { min: 0, max: 500000 },
    minRating: 0,
    languages: [],
  })

  const categories = [
    { id: "van-hoc", label: "Văn học", count: 156 },
    { id: "ky-nang-song", label: "Kỹ năng sống", count: 234 },
    { id: "kinh-doanh", label: "Kinh doanh", count: 89 },
    { id: "tam-ly", label: "Tâm lý", count: 127 },
    { id: "lich-su", label: "Lịch sử", count: 78 },
    { id: "kinh-te", label: "Kinh tế", count: 65 },
  ]

  const languages = [
    { id: "tieng-viet", label: "Tiếng Việt", count: 450 },
    { id: "english", label: "English", count: 189 },
    { id: "song-ngu", label: "Song ngữ", count: 67 },
  ]

  const handleCategoryChange = (categoryLabel: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryLabel]
      : filters.categories.filter((c) => c !== categoryLabel)

    const newFilters = { ...filters, categories: newCategories }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: { min: value[0], max: value[1] } }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleRatingChange = (value: string) => {
    const newFilters = { ...filters, minRating: Number.parseFloat(value) }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleLanguageChange = (languageLabel: string, checked: boolean) => {
    const newLanguages = checked
      ? [...filters.languages, languageLabel]
      : filters.languages.filter((l) => l !== languageLabel)

    const newFilters = { ...filters, languages: newLanguages }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      categories: [],
      priceRange: { min: 0, max: 500000 },
      minRating: 0,
      languages: [],
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Bộ lọc</h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Đặt lại
        </Button>
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Thể loại</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={filters.categories.includes(category.label)}
                onCheckedChange={(checked) => handleCategoryChange(category.label, checked as boolean)}
              />
              <Label
                htmlFor={category.id}
                className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
              >
                <span>{category.label}</span>
                <span className="text-muted-foreground text-xs">({category.count})</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Khoảng giá</h4>
        <div className="px-2">
          <Slider
            min={0}
            max={500000}
            step={10000}
            value={[filters.priceRange.min, filters.priceRange.max]}
            onValueChange={handlePriceChange}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{filters.priceRange.min.toLocaleString("vi-VN")}đ</span>
          <span className="text-muted-foreground">{filters.priceRange.max.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      <Separator />

      {/* Rating Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Đánh giá</h4>
        <RadioGroup value={filters.minRating.toString()} onValueChange={handleRatingChange}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
              <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 cursor-pointer">
                <div className="flex items-center">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  {Array.from({ length: 5 - rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-muted-foreground/30" />
                  ))}
                </div>
                <span className="text-sm">trở lên</span>
              </Label>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="rating-all" />
            <Label htmlFor="rating-all" className="text-sm cursor-pointer">
              Tất cả
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Language Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Ngôn ngữ</h4>
        <div className="space-y-2">
          {languages.map((language) => (
            <div key={language.id} className="flex items-center space-x-2">
              <Checkbox
                id={language.id}
                checked={filters.languages.includes(language.label)}
                onCheckedChange={(checked) => handleLanguageChange(language.label, checked as boolean)}
              />
              <Label
                htmlFor={language.id}
                className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
              >
                <span>{language.label}</span>
                <span className="text-muted-foreground text-xs">({language.count})</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
