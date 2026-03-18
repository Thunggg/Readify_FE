import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const TicketStatus = {
  OPEN: "OPEN",
  WAITING_ADMIN: "WAITING_ADMIN",
  WAITING_CUSTOMER: "WAITING_CUSTOMER",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

const statusStyles: Record<TicketStatus, string> = {
  OPEN: "border-none bg-green-600/10 text-green-700 dark:bg-green-400/10 dark:text-green-300",
  WAITING_ADMIN:
    "border-none bg-amber-600/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  WAITING_CUSTOMER:
    "border-none bg-blue-600/10 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
  CLOSED: "border-none bg-muted text-muted-foreground",
};

const label: Record<TicketStatus, string> = {
  OPEN: "Open",
  WAITING_ADMIN: "Waiting admin",
  WAITING_CUSTOMER: "Waiting customer",
  CLOSED: "Closed",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status])}>
      {label[status]}
    </Badge>
  );
}

