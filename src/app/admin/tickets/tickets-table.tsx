"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

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
import type { Ticket, TicketStatusValue } from "@/types/ticket";

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

function asTime(value?: string) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function TicketsTable() {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilters, setStatusFilters] = useState<TicketStatusValue[]>([]);

  const [sortField, setSortField] = useState<SortField>("lastMessageAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {

      try {
        const response = await TicketApiRequest.getAllTickets();

        if (!response?.payload?.success) {
  handleErrorApi({
    error: "Failed to fetch tickets",
    duration: 5000,
  });
  return;
}

        setAllTickets(response.payload?.data?.items ?? []); 

      } catch (error) {
        handleErrorApi({ error, duration: 5000 });
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    return allTickets.filter((t) => {
      const matchesSearch =
        !q ||
        t._id.toLowerCase().includes(q) ||
        t.customerId?.email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q);

      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(t.status);

      return matchesSearch && matchesStatus;
    });
  }, [allTickets, searchValue, statusFilters]);

  const sortedTickets = useMemo(() => {
    if (!sortField || !sortOrder) return filteredTickets;
    const dir = sortOrder === "asc" ? 1 : -1;

    const copy = [...filteredTickets];
    copy.sort((a, b) => {
      const av =
        sortField === "createdAt"
          ? asTime(a.createdAt)
          : asTime(a.lastMessageAt);
      const bv =
        sortField === "createdAt"
          ? asTime(b.createdAt)
          : asTime(b.lastMessageAt);
      return (av - bv) * dir;
    });
    return copy;
  }, [filteredTickets, sortField, sortOrder]);

  const total = sortedTickets.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const effectivePage = Math.min(page, totalPages);

  const paginatedTickets = useMemo(() => {
    const start = (effectivePage - 1) * limit;
    return sortedTickets.slice(start, start + limit);
  }, [sortedTickets, effectivePage, limit]);

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
          setAllTickets((prev) =>
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
          {paginatedTickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center">
                <div className="text-sm text-muted-foreground">
                  No tickets found.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedTickets.map((t) => {
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

      {total > limit && (
        <div className="mt-4">
          <PaginationControls
            currentPage={effectivePage}
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

