import http from "@/lib/http";
import { ApiPaginatedResponse, ApiResponse } from "@/types/api";
import type {
  Ticket,
  TicketSortByValue,
  TicketStatusValue,
} from "@/types/ticket";

export const TicketApiRequest = {
  getAllTickets: async (params?: {
    search?: string;
    statusFilter?: TicketStatusValue[];
    sortBy?: TicketSortByValue;
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) => {
    const response = await http.get<ApiPaginatedResponse<Ticket>>(
      "/admin/tickets",
      {
        params,
        credentials: "include",
        cache: "no-store",
      },
    );
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

  createTicket: async (subject: string, message: string) => {
    const response = await http.post<ApiResponse<Ticket>>(
      "/tickets",
      {
        subject,
        message,
      },
      {
        credentials: "include",
      },
    );
    return response;
  },

  getMyTickets: async (params?: {
    search?: string;
    statusFilter?: TicketStatusValue[];
    sortBy?: TicketSortByValue;
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) => {
    const response = await http.get<ApiPaginatedResponse<Ticket>>("/tickets", {
      cache: "no-store",
      credentials: "include",
      params,
    });
    return response;
  },

  customerReplyToTicket: async (
    ticketId: string,
    body: { message: string },
  ) => {
    const response = await http.post<ApiResponse<Ticket>>(
      `/tickets/${ticketId}/reply`,
      body,
      {
        credentials: "include",
      },
    );
    return response;
  },

  closeTicket: async (ticketId: string) => {
    const response = await http.patch<ApiResponse<Ticket>>(
      `/tickets/${ticketId}/close`,
      {
        credentials: "include",
      },
    );
    return response;
  },

  rateTicket: async (
    ticketId: string,
    body: { rating: number; comment?: string },
  ) => {
    const response = await http.patch<ApiResponse<Ticket>>(
      `/tickets/${ticketId}/rating`,
      body,
      {
        credentials: "include",
      },
    );
    return response;
  },
};
