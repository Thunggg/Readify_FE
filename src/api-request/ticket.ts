import http from "@/lib/http";
import { ApiResponse } from "@/types/api";
import type { Ticket } from "@/types/ticket";

export const TicketApiRequest = {
  getAllTickets: async () => {
    const response = await http.get<ApiResponse<Ticket[]>>("/admin/tickets", {
      credentials: "include",
      cache: "no-store",
    });
    return response;
  },

  replyToTicket: async (ticketId: string, body: { message: string }) => {
    const response = await http.post<ApiResponse<Ticket>>(
      `/admin/tickets/${ticketId}/reply`,
      body,
      {
        credentials: "include",
      },
    );
    return response;
  },
};
