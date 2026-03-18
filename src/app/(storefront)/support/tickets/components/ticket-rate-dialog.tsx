"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn, handleErrorApi } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";
import { TicketApiRequest } from "@/api-request/ticket";
import { toast } from "sonner";

export default function TicketRateDialog({
  open,
  onOpenChange,
  ticket,
  onRated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  onRated: (updatedTicket: Ticket) => void;
}) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const canSubmit = useMemo(() => rating >= 1 && rating <= 5, [rating]);

  const handleRateTicket = async () => {
    try {
      const response = await TicketApiRequest.rateTicket(ticket?._id as string, { rating, comment });

      if(response?.payload?.success) {
        toast.success(response?.payload?.message ?? "Ticket rated successfully", {
          style: {
            "--normal-bg": "light-dark(var(--color-green-600), var(--color-green-400))",
            "--normal-text": "var(--color-white)",
          } as React.CSSProperties,
        });
        onRated(response?.payload?.data as Ticket);
      } else {
        toast.error(response?.payload?.message ?? "Failed to rate ticket", {
          style: {
            "--normal-bg": "light-dark(var(--color-red-600), var(--color-red-400))",
            "--normal-text": "var(--color-white)",
          } as React.CSSProperties,
        });
      }

    } catch (error) {
      handleErrorApi({ error, duration: 5000 });
    } finally {
      setRating(0);
      setComment("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setRating(0);
          setComment("");
        }
        if (nextOpen) {
          setRating(ticket?.csat?.rating ?? 0);
          setComment(ticket?.csat?.comment ?? "");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Đánh giá hỗ trợ (CSAT)</DialogTitle>
          <DialogDescription>
            Hãy chấm điểm trải nghiệm hỗ trợ của bạn cho ticket{" "}
            <span className="font-mono">#{ticket?._id ?? "—"}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Rating (1–5)</div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, idx) => {
                const value = idx + 1;
                const active = value <= rating;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={cn(
                      "rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active ? "text-amber-500" : "text-muted-foreground",
                    )}
                    aria-label={`Rate ${value} star`}
                  >
                    <Star
                      className="size-6"
                      fill={active ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
              {rating ? (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5
                </span>
              ) : (
                <span className="ml-2 text-sm text-muted-foreground">
                  Chọn số sao
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Comment (tuỳ chọn)</div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bạn có thể góp ý thêm về trải nghiệm hỗ trợ..."
              rows={5}
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/2000
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRating(0);
              setComment("");
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              handleRateTicket();
              onOpenChange(false);
              
            }}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

