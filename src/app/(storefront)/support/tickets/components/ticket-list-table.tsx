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
import { TicketStatusBadge, type TicketStatus } from "./ticket-status-badge";
import { useEffect, useState } from "react";
import { TicketApiRequest } from "@/api-request/ticket";
import { handleErrorApi } from "@/lib/utils";
import { Ticket } from "@/types/ticket";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

dayjs.extend(relativeTime);


export function TicketListTable() {
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      const response = await TicketApiRequest.getMyTickets();

      console.log(response);

      if (!response?.payload?.success) {
        handleErrorApi({ error: response?.payload, duration: 5000 });
        return;
      }
      setTickets(response.payload.data.items ?? []);
    };

    fetchTickets();
  }, []);

  return(
    <>
    {tickets.length === 0 ? (
      <>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No tickets found</EmptyTitle>
          <EmptyDescription>You don&apos;t have any tickets yet.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      </>
    ) : (
      <>
      <div className="border rounded-lg overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Last Message</TableHead>
            <TableHead className="hidden md:table-cell">Created Date</TableHead>
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
                {dayjs(ticket.lastMessageAt).fromNow()}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {dayjs(ticket.createdAt).format("DD/MM/YYYY")}
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
      </>
    )}
    
    </>
  )
}

