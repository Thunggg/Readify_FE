"use client";

import StatusFilterDropdown from "./status-filter-dropdown";
import SearchInput from "./search-input";
import type { TicketStatusValue } from "@/types/ticket";

export default function TicketsToolbar({
  searchValue,
  setSearchValue,
  statusFilters,
  setStatusFilters,
  onClearFilters,
}: {
  searchValue: string;
  setSearchValue: (value: string) => void;
  statusFilters: TicketStatusValue[];
  setStatusFilters: (next: TicketStatusValue[]) => void;
  onClearFilters: () => void;
}) {
  const total = statusFilters.length;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex flex-1 gap-2">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search by ticket ID, customer ID, or subject..."
          className="flex-1"
        />
        <StatusFilterDropdown value={statusFilters} onChange={setStatusFilters} />
      </div>

      {total > 0 || searchValue ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 w-fit"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}

