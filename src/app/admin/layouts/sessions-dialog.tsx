"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { AccountApiRequest } from "@/api-request/account";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AccountSession } from "@/types/session";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDate(value?: string | Date) {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function SessionsDialog({ open, onOpenChange }: Props) {
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCount = useMemo(
    () => sessions.filter((s) => s.isCurrent).length,
    [sessions]
  );

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AccountApiRequest.getSessions();
      const payload: any = res?.payload;
      if (payload?.success === true) setSessions(payload.data ?? []);
      else if (payload?.success === false)
        setError(payload?.message || "Failed to load sessions.");
      else if (Array.isArray(payload)) setSessions(payload);
      else if (Array.isArray(payload?.data)) setSessions(payload.data);
      else setError("Failed to load sessions.");
    } catch (e: any) {
      setError(e?.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadSessions();
  }, [open, loadSessions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Login sessions</DialogTitle>

          <div className="flex justify-start mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSessions}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Không tải được sessions</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <ScrollArea className="max-h-[55vh] pr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Device / User agent</TableHead>
                <TableHead className="w-[16%]">IP</TableHead>
                <TableHead className="w-[22%]">Last used</TableHead>
                <TableHead className="w-[22%]">Created</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-4 w-[320px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[180px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-[84px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground text-center py-8"
                  >
                    Không có session nào.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((s) => (
                  <TableRow
                    key={s.id}
                    className={s.isCurrent ? "bg-muted/30" : undefined}
                  >
                    <TableCell className="max-w-[520px]">
                      <div className="truncate" title={s.userAgent || ""}>
                        {s.userAgent || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ID: {s.id}
                      </div>
                    </TableCell>
                    <TableCell>{s.ipAddress || "-"}</TableCell>
                    <TableCell>{formatDate(s.lastUsedAt)}</TableCell>
                    <TableCell>{formatDate(s.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {s.isCurrent ? (
                        <Badge variant="secondary">Current</Badge>
                      ) : (
                        <Badge variant="outline">Other</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

