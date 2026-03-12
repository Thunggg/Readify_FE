"use client";

import { Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TicketStatus, type TicketStatus as TicketStatusValue } from "./ticket-status-badge";

type Option = { key: TicketStatusValue; label: string };

const statusOptions: Option[] = [
  { key: TicketStatus.OPEN, label: "Open" },
  { key: TicketStatus.WAITING_ADMIN, label: "Waiting admin" },
  { key: TicketStatus.WAITING_CUSTOMER, label: "Waiting customer" },
  { key: TicketStatus.CLOSED, label: "Closed" },
];

export default function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: TicketStatusValue[];
  onChange: (next: TicketStatusValue[]) => void;
}) {
  const total = value.length;

  const toggle = (k: TicketStatusValue, checked: boolean) => {
    if (checked) {
      onChange(value.includes(k) ? value : [...value, k]);
      return;
    }
    onChange(value.filter((x) => x !== k));
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Status
          <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
            {total}
          </Badge>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Filters</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <div className="px-2 py-1.5 text-sm font-semibold">Status</div>
          {statusOptions.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.key}
              className="cursor-pointer"
              checked={value.includes(opt.key)}
              onCheckedChange={(checked) => toggle(opt.key, Boolean(checked))}
              onSelect={(e) => e.preventDefault()}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {total > 0 && (
          <DropdownMenuCheckboxItem
            onSelect={() => onChange([])}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            Clear status filters
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

