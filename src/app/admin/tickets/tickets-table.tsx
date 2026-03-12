"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { TicketApiRequest } from "@/api-request/ticket";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { handleErrorApi } from "@/lib/utils";
import type { PaginationMeta } from "@/types/api";
import type { Ticket, TicketSortByValue, TicketStatusValue } from "@/types/ticket";

import PaginationControls from "../accounts/components/pagination-controls";
import TicketDetailDrawer from "./components/ticket-detail-drawer";
import TicketsToolbar from "./components/tickets-toolbar";
import SortableHeader from "./components/sort-header";

export type SortField = "createdAt" | "lastMessageAt" | null;
export type SortOrder = "asc" | "desc" | null;

const statusClass: Record<TicketStatusValue, string> = {
  OPEN: "border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
  WAITING_ADMIN:
    "border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  WAITING_CUSTOMER:
    "border-none bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
  CLOSED: "border-none bg-muted text-muted-foreground",
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function TicketsTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilters, setStatusFilters] = useState<TicketStatusValue[]>([]);

  const [sortField, setSortField] = useState<SortField>("lastMessageAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const debouncedSearchValue = useDebouncedValue(searchValue.trim(), 300);

  useEffect(() => {
    let cancelled = false;

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await TicketApiRequest.getAllTickets(
          {
            search: debouncedSearchValue || undefined,
            statusFilter: statusFilters.length ? statusFilters : undefined,
            sortBy: sortField ?? undefined,
            order: sortOrder ?? undefined,
            page,
            limit,
          } satisfies {
            search?: string;
            statusFilter?: TicketStatusValue[];
            sortBy?: TicketSortByValue;
            order?: "asc" | "desc";
            page?: number;
            limit?: number;
          },
        );

        if (!response?.payload?.success) {
          handleErrorApi({
            error: "Failed to fetch tickets",
            duration: 5000,
          });
          return;
        }

        const items = response.payload?.data?.items ?? [];
        const nextMeta = response.payload?.data?.meta;
        if (cancelled) return;

        setTickets(items);
        setMeta(nextMeta);
      } catch (error) {
        if (cancelled) return;
        handleErrorApi({ error, duration: 5000 });
        setTickets([]);
        setMeta(undefined);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTickets();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchValue, statusFilters, sortField, sortOrder, page, limit]);

  const totalPages =
    meta?.totalPages ??
    (meta?.total ? Math.max(1, Math.ceil(meta.total / (meta.limit ?? limit))) : 1);
  const currentPage = meta?.page ?? page;

  const onSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  return (
    <>
      <TicketDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        ticket={selectedTicket}
        onTicketUpdated={(nextTicket) => {
          setSelectedTicket(nextTicket);
          setTickets((prev: Ticket[]) =>
            prev.map((t) => (t._id === nextTicket._id ? nextTicket : t)),
          );
        }}
      />

      <TicketsToolbar
        searchValue={searchValue}
        setSearchValue={(v) => {
          setSearchValue(v);
          setPage(1);
        }}
        statusFilters={statusFilters}
        setStatusFilters={(next) => {
          setStatusFilters(next);
          setPage(1);
        }}
        onClearFilters={() => {
          setSearchValue("");
          setStatusFilters([]);
          setPage(1);
        }}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[40%]">Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <SortableHeader
                title="Created"
                field="createdAt"
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead>
              <SortableHeader
                title="Last message"
                field="lastMessageAt"
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </TableCell>
            </TableRow>
          ) : tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center">
                <div className="text-sm text-muted-foreground">
                  No tickets found.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((t) => {
              const lastMsg = t.messages?.[t.messages.length - 1];
              return (
                <TableRow
                  key={t._id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTicket(t);
                    setDetailOpen(true);
                  }}
                >
                  <TableCell className="font-mono text-sm text-primary">
                    {t._id}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {t.customerId.firstName + " " + t.customerId.lastName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {t.customerId.email}
                  </TableCell>
                  <TableCell className="max-w-[520px]">
                    <div className="font-medium truncate">{t.subject}</div>
                    {lastMsg ? (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {lastMsg.senderRole}: {lastMsg.body}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusClass[t.status]}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.createdAt
                      ? dayjs(t.createdAt).format("DD/MM/YYYY HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.lastMessageAt
                      ? dayjs(t.lastMessageAt).format("DD/MM/YYYY HH:mm")
                      : "-"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-4">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(next) =>
              setPage(Math.min(Math.max(1, next), totalPages))
            }
          />
        </div>
      )}
    </>
  );
}

