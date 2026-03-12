"use client";

import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { TicketApiRequest } from "@/api-request/ticket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { handleErrorApi } from "@/lib/utils";
import { type Ticket } from "@/types/ticket";
import { Loader2, Star } from "lucide-react";

export default function TicketDetailDrawer({
  open,
  onOpenChange,
  ticket,
  onTicketUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  onTicketUpdated?: (ticket: Ticket) => void;
}) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const canReply = useMemo(
    () => Boolean(ticket?._id) && replyMessage.trim().length > 0 && !isSending,
    [ticket?._id, replyMessage, isSending],
  );

  const onSendReply = async () => {
    const t = ticket;
    const message = replyMessage.trim();
    if (!t?._id || !message || isSending) return;

    try {
      setIsSending(true);
      const res = await TicketApiRequest.replyToTicket(t._id, { message });

      if (!res?.payload?.success) {
        handleErrorApi({
          error: new Error(res?.payload?.message ?? "Reply failed"),
          duration: 5000,
        });
        return;
      }

      toast.success(res?.payload?.message ?? "Replied successfully", {
        style: {
          "--normal-bg": "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-text": "var(--color-white)",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });


      onTicketUpdated?.(res?.payload?.data as Ticket);
      setReplyMessage("");
    } catch (error) {
      handleErrorApi({ error, duration: 5000 });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0">
        <DrawerHeader>
          <DrawerTitle>Ticket detail</DrawerTitle>
          <DrawerDescription className="flex flex-col gap-1">
            <span className="font-mono text-xs">{ticket?._id ?? "-"}</span>
            {ticket ? (
              <Badge variant="outline" className="w-fit">
                {ticket.status}
              </Badge>
            ) : null}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Customer</div>
              <div className="font-mono">{ticket?.customerId.firstName + " " + ticket?.customerId.lastName}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Assigned to</div>
              <div className="font-mono">{ticket?.assignedToId?.firstName + " " + ticket?.assignedToId?.lastName}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Created</div>
              <div>
                {ticket?.createdAt
                  ? dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Last message</div>
              <div>
                {ticket?.lastMessageAt
                  ? dayjs(ticket.lastMessageAt).format("DD/MM/YYYY HH:mm")
                  : "-"}
              </div>
            </div>
          </div>

          <div className="text-sm">
            <div className="text-muted-foreground">Subject</div>
            <div className="font-medium">{ticket?.subject ?? "-"}</div>
          </div>

          <div className="text-sm">
            <div className="text-muted-foreground">Messages</div>
            <div className="mt-2 space-y-2">
              {(ticket?.messages ?? []).map((m, idx) => (
                <div key={idx} className="rounded-md border p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">
                      {m.senderRole} • {m.senderId}
                    </span>
                    <span>{dayjs(m.createdAt).format("DD/MM/YYYY HH:mm")}</span>
                  </div>
                  <div className="mt-2 text-sm whitespace-pre-wrap">{m.body}</div>
                </div>
              ))}

              {(ticket?.messages?.length ?? 0) === 0 ? (
                <div className="text-muted-foreground text-sm">No messages.</div>
              ) : null}
            </div>
          </div>

          <div className="text-sm">
            <div className="text-muted-foreground">Reply</div>
            <div className="mt-2 rounded-md border p-3 space-y-3">
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                disabled={!ticket?._id || isSending}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReplyMessage("")}
                  disabled={isSending || replyMessage.trim().length === 0}
                >
                  Clear
                </Button>
                <Button type="button" onClick={onSendReply} disabled={!canReply}>
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reply"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {ticket?.csat ? (
            <div className="text-sm">
              <div className="text-muted-foreground">CSAT</div>
              <div className="mt-2 rounded-md border p-3 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const value = idx + 1;
                      const active = value <= (ticket.csat?.rating ?? 0);
                      return (
                        <Star
                          key={value}
                          className={
                            active ? "size-4 text-amber-500" : "size-4 text-muted-foreground"
                          }
                          fill={active ? "currentColor" : "none"}
                        />
                      );
                    })}
                    <span className="ml-2 font-medium">
                      {ticket.csat.rating ? `${ticket.csat.rating}/5` : "-"}
                    </span>
                  </div>
                </div>
                {ticket.csat.comment ? (
                  <div className="whitespace-pre-wrap">{ticket.csat.comment}</div>
                ) : null}
                {ticket.csat.submittedAt ? (
                  <div className="text-xs text-muted-foreground">
                    Submitted{" "}
                    {dayjs(ticket.csat.submittedAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

