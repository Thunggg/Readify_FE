"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterIcon, SortAscIcon, SortDescIcon, XIcon } from "lucide-react";
import { SortField, SortOrder } from "../reviews-table";

export interface FilterState {
  status: string[];
  rating: string[];
}

interface ReviewsToolbarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

const statusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const ratingOptions = [
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
];

const sortOptions = [
  { label: "Date", value: "createdAt" },
  { label: "Rating", value: "rating" },
  { label: "Helpful", value: "helpfulCount" },
];

export default function ReviewsToolbar({
  filters,
  onFiltersChange,
  sortField,
  sortOrder,
  onSortChange,
}: ReviewsToolbarProps) {
  const handleStatusChange = (value: string, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, value]
      : filters.status.filter((v) => v !== value);
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleRatingChange = (value: string, checked: boolean) => {
    const newRating = checked
      ? [...filters.rating, value]
      : filters.rating.filter((v) => v !== value);
    onFiltersChange({ ...filters, rating: newRating });
  };

  const clearFilters = () => {
    onFiltersChange({ status: [], rating: [] });
  };

  const hasFilters = filters.status.length > 0 || filters.rating.length > 0;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FilterIcon className="size-4 mr-2" />
              Status
              {filters.status.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 text-xs">
                  {filters.status.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.status.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleStatusChange(option.value, checked)
                }
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Rating Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FilterIcon className="size-4 mr-2" />
              Rating
              {filters.rating.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 text-xs">
                  {filters.rating.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Rating</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ratingOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.rating.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleRatingChange(option.value, checked)
                }
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <XIcon className="size-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <Select
          value={sortField ?? "createdAt"}
          onValueChange={(value) => onSortChange(value as SortField, sortOrder)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            onSortChange(sortField, sortOrder === "asc" ? "desc" : "asc")
          }
        >
          {sortOrder === "asc" ? (
            <SortAscIcon className="size-4" />
          ) : (
            <SortDescIcon className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
