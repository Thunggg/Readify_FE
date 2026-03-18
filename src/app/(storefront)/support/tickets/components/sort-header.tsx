"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortField = "createdAt" | "lastMessageAt" | null;
export type SortOrder = "asc" | "desc" | null;

export default function SortableHeader({
  title,
  field,
  sortField,
  sortOrder,
  onSortChange,
}: {
  title: string;
  field: Exclude<SortField, null>;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const isActive = sortField === field;
  const activeLabel = useMemo(() => {
    if (!isActive || !sortOrder) return null;
    return sortOrder === "asc" ? "Asc" : "Desc";
  }, [isActive, sortOrder]);

  const setSort = (nextField: SortField, nextOrder: SortOrder) => {
    onSortChange(nextField, nextOrder);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 font-medium">
          {title}
          {activeLabel ? (
            <span className="ml-2 text-xs text-muted-foreground">
              ({activeLabel})
            </span>
          ) : null}
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-36">
        <DropdownMenuItem onClick={() => setSort(field, "asc")}>
          <ArrowUp className="mr-2 size-4" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSort(field, "desc")}>
          <ArrowDown className="mr-2 size-4" />
          Desc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSort(null, null)}>
          Clear
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

