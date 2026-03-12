"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquareText, SendHorizonal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn, handleErrorApi } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";
import { TicketStatusBadge } from "./ticket-status-badge";
import { TicketApiRequest } from "@/api-request/ticket";
import { toast } from "sonner";

export default function TicketDetailDialog({
  open,
  onOpenChange,
  ticket,
  setSelectedTicket,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
}) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const canSend = useMemo(
    () => Boolean(ticket?._id) && replyMessage.trim().length > 0 && !isSending,
    [ticket?._id, replyMessage, isSending],
  );
  
  const onSendReply = async () => {
    try {
      setIsSending(true);
      const response = await TicketApiRequest.customerReplyToTicket(ticket?._id as string, { message: replyMessage.trim() });
      if (!response?.payload?.success) {
        handleErrorApi({ error: new Error(response?.payload?.message ?? "Failed to send reply"), duration: 5000 });
        return;
      }

      toast.success(response?.payload?.message ?? "Reply sent successfully", {
      style: {
        "--normal-bg": "light-dark(var(--color-green-600), var(--color-green-400))",
        "--normal-text": "var(--color-white)",
        "--normal-border":
          "light-dark(var(--color-green-600), var(--color-green-400))",
      } as React.CSSProperties,
    });

    setSelectedTicket(response?.payload?.data as Ticket);
    setReplyMessage("");
    } catch (error) {
      handleErrorApi({ error, duration: 5000 });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2">
                <MessageSquareText className="size-5 text-primary" />
                Ticket detail
                {ticket?._id ? (
                  <Badge variant="secondary" className="font-mono">
                    #{ticket._id}
                  </Badge>
                ) : null}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {ticket?.subject ?? "—"}
              </DialogDescription>
            </div>

            {ticket?.status ? <TicketStatusBadge status={ticket.status} /> : null}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-background">
                <div className="px-4 py-3 border-b">
                  <div className="text-sm font-medium">Messages</div>
                </div>

                <div className="p-4 space-y-3 max-h-[320px] overflow-auto">
                  {(ticket?.messages ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No messages.
                    </div>
                  ) : (
                    (ticket?.messages ?? []).map((m, idx) => {
                      const isCustomer = m.senderRole === "CUSTOMER";
                      return (
                        <div
                          key={`${m.createdAt}-${idx}`}
                          className={cn(
                            "rounded-md border p-3",
                            isCustomer ? "bg-background" : "bg-muted/40",
                          )}
                        >
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono">
                              {m.senderRole} • {m.senderId}
                            </span>
                            <span>
                              {dayjs(m.createdAt).format("DD/MM/YYYY HH:mm")}
                            </span>
                          </div>
                          <div className="mt-2 text-sm whitespace-pre-wrap">
                            {m.body}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-4 border-t space-y-3">
                  <div className="text-sm font-medium">Reply</div>
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Nhập tin nhắn phản hồi..."
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
                    <Button
                      type="button"
                      disabled={!canSend}
                      onClick={onSendReply}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <SendHorizonal className="mr-2 size-4" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border bg-background p-4">
                <div className="text-sm font-medium">Ticket info</div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {ticket?.createdAt
                        ? dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Last message</span>
                    <span className="font-medium">
                      {ticket?.lastMessageAt
                        ? dayjs(ticket.lastMessageAt).format("DD/MM/YYYY HH:mm")
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <div className="text-sm font-medium">Tips</div>
                <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-2">
                  <li>Ghi rõ bước thực hiện và màn hình bạn đang ở.</li>
                  <li>Không chia sẻ mật khẩu/OTP.</li>
                  <li>Đính kèm ảnh/video nếu có lỗi hiển thị.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

