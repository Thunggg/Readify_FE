"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Eye, Star, X } from "lucide-react";

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
import { TicketStatus, TicketStatusBadge } from "./ticket-status-badge";
import SortableHeader, { type SortField, type SortOrder } from "./sort-header";
import TicketsToolbar from "./tickets-toolbar";
import { Ticket, TicketSortByValue, TicketStatusValue } from "@/types/ticket";
import { TicketApiRequest } from "@/api-request/ticket";
import { handleErrorApi } from "@/lib/utils";
import PaginationControls from "@/app/admin/accounts/components/pagination-controls";
import TicketDetailDialog from "./ticket-detail-dialog";
import TicketRateDialog from "./ticket-rate-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner";


dayjs.extend(relativeTime);

export function TicketListTable() {
  // UI-only states (do not apply to data)
  const [searchValue, setSearchValue] = useState("");
  const [statusFilters, setStatusFilters] = useState<TicketStatus[]>([]);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(3);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [isCloseTicket, setIsCloseTicket] = useState(false);
  const [closeTicket, setCloseTicket] = useState<Ticket | null>(null);

  const [isRateTicket, setIsRateTicket] = useState(false);
  const [rateTicket, setRateTicket] = useState<Ticket | null>(null);

  const onSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const response = await TicketApiRequest.closeTicket(ticketId);

      if (!response?.payload?.success) {
        handleErrorApi({ error: new Error(response?.payload?.message ?? "Failed to close ticket"), duration: 5000 });
        return;
      }

      toast.success(response?.payload?.message ?? "Ticket closed successfully", {
        style: {
          "--normal-bg": "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-text": "var(--color-white)",
          "--normal-border": "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });

      setTickets(tickets.map((ticket) => ticket._id === ticketId ? response?.payload?.data as Ticket : ticket));
    } catch (error) {
      handleErrorApi({ error, duration: 5000 });
    } finally {
      setIsCloseTicket(false);
      setCloseTicket(null);
    }
  };


  useEffect(() => {
    let cancelled = false;

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await TicketApiRequest.getMyTickets({
          search: searchValue || undefined,
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
        }); // satisfies để kiểm tra type của response

        if (cancelled) return;

        if (!response?.payload?.success) {
          handleErrorApi({
            error: "Failed to fetch tickets",
            duration: 5000,
          });
          setTickets([]);
          return;
        }

        const items = response.payload?.data?.items ?? [];
        const nextMeta = response.payload?.data?.meta;
        if (cancelled) return;

        setTickets(items);
        setTotalPages(nextMeta?.totalPages ?? 1);
        setCurrentPage(nextMeta?.page ?? 1);
      } catch (error) {
        if (cancelled) return;
        handleErrorApi({ error, duration: 5000 });
        setTickets([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    
    fetchTickets();

    return () => {
      cancelled = true;
    };
  }, [searchValue, statusFilters, sortField, sortOrder, page, limit]);

  return (
    <>
      <TicketDetailDialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open){
             setSelectedTicket(null)
          };
        }}
        ticket={selectedTicket}
        setSelectedTicket={setSelectedTicket}
      />

      <AlertDialog open={isCloseTicket} onOpenChange={setIsCloseTicket}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this ticket?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => closeTicket && handleCloseTicket(closeTicket._id)}
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TicketRateDialog
        open={isRateTicket}
        onOpenChange={(open) => {
          setIsRateTicket(open);
          if (!open) setRateTicket(null);
        }}
        ticket={rateTicket}
        onRated={(updatedTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
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
          setSortField(null);
          setSortOrder(null);
          setPage(1);
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setDetailOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    {ticket.status !== TicketStatus.CLOSED && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            setIsCloseTicket(true);
                            setCloseTicket(ticket);
                          }}
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Close</span>
                        </Button>
                      </>
                    )}

                    {(ticket.status === TicketStatus.CLOSED && !ticket.csat)&& (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            setIsRateTicket(true);
                            setRateTicket(ticket);
                          }}
                        >
                          <Star className="w-4 h-4" />
                          <span className="hidden sm:inline">Rate</span>
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-4">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(next) => setPage(next)}
          />
        </div>
      ) : null}
    </>
  );
}

