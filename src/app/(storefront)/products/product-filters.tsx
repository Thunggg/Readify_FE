"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { CategoryApiRequest, type Category } from "@/api-request/category"
import { BookApiRequest } from "@/api-request/book"

interface FilterState {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: FilterState
}

function normalizeCategories(data: unknown): Category[] {
  if (Array.isArray(data)) return data as Category[]

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>

    if (Array.isArray(record.items)) return record.items as Category[]
    if (Array.isArray(record.categories)) return record.categories as Category[]
    if (Array.isArray(record.data)) return record.data as Category[]
  }

  return []
}

export function ProductFilters({ onFilterChange, initialFilters }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categoryId: initialFilters?.categoryId || "",
    minPrice: initialFilters?.minPrice,
    maxPrice: initialFilters?.maxPrice,
    inStock: initialFilters?.inStock || false,
  })
  
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [minPriceInput, setMinPriceInput] = useState(initialFilters?.minPrice?.toString() || "")
  const [maxPriceInput, setMaxPriceInput] = useState(initialFilters?.maxPrice?.toString() || "")
  const [priceError, setPriceError] = useState<string | null>(null)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let finalCategories: Category[] = []

        const res = await CategoryApiRequest.getCategories({ status: 1 })
        if (res && res.payload.success) {
          finalCategories = normalizeCategories(res.payload.data as unknown)
        }

        if (finalCategories.length === 0) {
          const fallbackRes = await CategoryApiRequest.getCategories()
          if (fallbackRes && fallbackRes.payload.success) {
            finalCategories = normalizeCategories(fallbackRes.payload.data as unknown)
          }
        }

        if (finalCategories.length === 0) {
          // Last fallback: derive categories from public books payload.
          const booksRes = await BookApiRequest.getBooks({ page: 1, limit: 100 })
          const items = booksRes?.payload?.success ? booksRes.payload.data.items ?? [] : []
          const categoryMap = new Map<string, Category>()

          for (const book of items) {
            for (const c of book.categoryIds ?? []) {
              if (!categoryMap.has(c._id)) {
                categoryMap.set(c._id, {
                  _id: c._id,
                  name: c.name,
                  slug: c.slug,
                  status: 1,
                  sortOrder: 0,
                })
              }
            }
          }

          finalCategories = Array.from(categoryMap.values())
        }

        setCategories(finalCategories)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Sync with URL params
  useEffect(() => {
    if (initialFilters) {
      setFilters({
        categoryId: initialFilters.categoryId || "",
        minPrice: initialFilters.minPrice,
        maxPrice: initialFilters.maxPrice,
        inStock: initialFilters.inStock || false,
      })
      setMinPriceInput(initialFilters.minPrice?.toString() || "")
      setMaxPriceInput(initialFilters.maxPrice?.toString() || "")
    }
  }, [initialFilters])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategoryId = checked ? categoryId : ""
    const newFilters = { ...filters, categoryId: newCategoryId }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePriceApply = () => {
    const minPrice = minPriceInput.trim() === "" ? undefined : Number(minPriceInput)
    const maxPrice = maxPriceInput.trim() === "" ? undefined : Number(maxPriceInput)

    if ((minPriceInput.trim() !== "" && !Number.isFinite(minPrice as number)) || (maxPriceInput.trim() !== "" && !Number.isFinite(maxPrice as number))) {
      setPriceError("Please enter valid numbers for price.")
      return
    }

    if ((minPrice ?? 0) < 0 || (maxPrice ?? 0) < 0) {
      setPriceError("Price cannot be negative.")
      return
    }

    if (minPrice !== undefined && maxPrice !== undefined && maxPrice < minPrice) {
      setPriceError("Max price must be greater than or equal to min price.")
      return
    }

    setPriceError(null)
    
    const newFilters = { ...filters, minPrice, maxPrice }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleInStockChange = (checked: boolean) => {
    const newFilters = { ...filters, inStock: checked }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters: FilterState = {
      categoryId: "",
      minPrice: undefined,
      maxPrice: undefined,
      inStock: false,
    }
    setFilters(resetFilters)
    setMinPriceInput("")
    setMaxPriceInput("")
    setPriceError(null)
    onFilterChange(resetFilters)
  }

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Category</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {isLoadingCategories ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <div key={category._id} className="flex items-center space-x-2">
                <Checkbox
                  id={category._id}
                  checked={filters.categoryId === category._id}
                  onCheckedChange={(checked) => handleCategoryChange(category._id, checked as boolean)}
                />
                <Label
                  htmlFor={category._id}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {category.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No categories</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Price Range</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="min-price" className="text-xs text-muted-foreground">From</Label>
            <Input
              id="min-price"
              type="number"
              min={0}
              placeholder="0"
              value={minPriceInput}
              onChange={(e) => {
                setMinPriceInput(e.target.value)
                if (priceError) setPriceError(null)
              }}
              className="h-9 text-sm"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="max-price" className="text-xs text-muted-foreground">To</Label>
            <Input
              id="max-price"
              type="number"
              min={0}
              placeholder="No limit"
              value={maxPriceInput}
              onChange={(e) => {
                setMaxPriceInput(e.target.value)
                if (priceError) setPriceError(null)
              }}
              className="h-9 text-sm"
            />
          </div>
        </div>
        {priceError && <p className="text-xs text-destructive">{priceError}</p>}
        <Button 
          onClick={handlePriceApply} 
          className="w-full"
          variant="outline"
        >
          Apply
        </Button>
      </div>

      <Separator />

      {/* In Stock Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Status</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            In Stock
          </Label>
        </div>
      </div>
    </div>
  )
}
