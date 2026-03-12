"use client";

import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { useEffect, useState } from "react";
import { TicketStatusBadge, type TicketStatus } from "./ticket-status-badge";
import SortableHeader, { type SortField, type SortOrder } from "./sort-header";
import TicketsToolbar from "./tickets-toolbar";
import { Ticket, TicketSortByValue, TicketStatusValue } from "@/types/ticket";
import { TicketApiRequest } from "@/api-request/ticket";
import { handleErrorApi } from "@/lib/utils";

dayjs.extend(relativeTime);

export type TicketRow = {
  _id: string;
  subject: string;
  status: TicketStatus;
  lastMessageAt?: string | Date | null;
  createdAt?: string | Date | null;
};

export function TicketListTable() {
  // UI-only states (do not apply to data)
  const [searchValue, setSearchValue] = useState("");
  const [statusFilters, setStatusFilters] = useState<TicketStatus[]>([]);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  useEffect(() => {
    const fetchTickets = async () => {
      const response = await TicketApiRequest.getMyTickets({
        search: searchValue || undefined,
        statusFilter: statusFilters.length ? statusFilters : undefined,
        sortBy: sortField ?? undefined,
        order: sortOrder ?? undefined,
        page: 1,
        limit: 10,
      } satisfies {
        search?: string;
        statusFilter?: TicketStatusValue[];
        sortBy?: TicketSortByValue;
        order?: "asc" | "desc";
        page?: number;
        limit?: number;
      });

      if (!response?.payload?.success) {
        handleErrorApi({
          error: "Failed to fetch tickets",
          duration: 5000,
        });
        return;
      }
      setTickets(response.payload?.data?.items ?? []);
      setIsLoading(false);
    };
    fetchTickets();
  }, [searchValue, statusFilters, sortField, sortOrder]);

  return (
    <>
      <TicketsToolbar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        statusFilters={statusFilters}
        setStatusFilters={setStatusFilters}
        onClearFilters={() => {
          setSearchValue("");
          setStatusFilters([]);
          setSortField(null);
          setSortOrder(null);
        }}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No tickets found</EmptyTitle>
            <EmptyDescription>
              You don&apos;t have any tickets yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">
              <SortableHeader
                title="Last Message"
                field="lastMessageAt"
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <SortableHeader
                title="Created Date"
                field="createdAt"
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket._id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-mono text-xs font-medium">
                #{ticket._id}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {ticket.subject}
              </TableCell>
              <TableCell>
                <TicketStatusBadge status={ticket.status} />
              </TableCell>
              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                {ticket.lastMessageAt
                  ? dayjs(ticket.lastMessageAt).fromNow()
                  : "-"}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {ticket.createdAt
                  ? dayjs(ticket.createdAt).format("DD/MM/YYYY")
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild className="gap-1.5">
                  <Link href={`/support/tickets/${ticket._id}`}>
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
      )}
    </>
  );
}

