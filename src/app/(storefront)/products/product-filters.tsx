"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FilterState {
  minPrice?: number
  maxPrice?: number
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: FilterState
}

export function ProductFilters({ onFilterChange, initialFilters }: ProductFiltersProps) {
  const [minPriceInput, setMinPriceInput] = useState(initialFilters?.minPrice?.toString() || "")
  const [maxPriceInput, setMaxPriceInput] = useState(initialFilters?.maxPrice?.toString() || "")
  const [priceError, setPriceError] = useState<string | null>(null)

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
    
    onFilterChange({ minPrice, maxPrice })
  }

  const handleReset = () => {
    const resetFilters: FilterState = {
      minPrice: undefined,
      maxPrice: undefined,
    }
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
    </div>
  )
}
