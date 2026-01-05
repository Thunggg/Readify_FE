import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUp, ArrowDown, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type SortField = "email" | "fullName" | "phone" | "dateOfBirth" | "sex" | "status";
type SortOrder = "asc" | "desc" | null

export default function SortableHeader({
  title,
  field
}: {
  title: string;
  field: SortField;
}) {
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const [isOpen, setIsOpen] = useState(false);

    const setSort = (field: SortField, order: SortOrder) => {
        if(order === null){
            setSortField(null);
            setSortOrder(null);
        } else {
            setSortField(field);
            setSortOrder(order);
        }
        setIsOpen(false);
    }


  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 font-medium"
        >
          {title}
          {isOpen ? (
            <ChevronUp />
          ) : (
            <ChevronDown />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-32">

        <DropdownMenuItem onClick={() => setSort(field, "asc")}>
          <ArrowUp className="mr-2 size-4" />
          Asc
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setSort(field, "desc")}>
          <ArrowDown className="mr-2 size-4" />
          Desc
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
