import { AdminAccount } from "./account";

export const TicketStatus = {
  OPEN: "OPEN",
  WAITING_ADMIN: "WAITING_ADMIN",
  WAITING_CUSTOMER: "WAITING_CUSTOMER",
  CLOSED: "CLOSED",
} as const;

export type TicketStatusValue =
  (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketSenderRole = {
  CUSTOMER: "CUSTOMER",
  STAFF: "STAFF",
} as const;

export type TicketSenderRoleValue =
  (typeof TicketSenderRole)[keyof typeof TicketSenderRole];

export type TicketMessage = {
  senderId: string;
  senderRole: TicketSenderRoleValue;
  body: string;
  createdAt: string;
};

export type TicketCsat = {
  rating?: number;
  comment?: string;
  submittedAt?: string;
};

export type Ticket = {
  _id: string;
  customerId: AdminAccount;
  assignedToId?: AdminAccount;
  subject: string;
  status: TicketStatusValue;
  messages: TicketMessage[];
  lastMessageAt?: string;
  closedAt?: string;
  csat?: TicketCsat;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};
