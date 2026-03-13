"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LogOut, RefreshCcw } from "lucide-react";

import { AccountApiRequest } from "@/api-request/account";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { authApiRequest } from "@/api-request/auth";
import { toast } from "sonner";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  // đếm số lượng session hiện tại
//   const sessions = [
//   { id: "1", isCurrent: true },
//   { id: "2", isCurrent: false },
//   { id: "3", isCurrent: false },
// ];
  const currentCount = useMemo(
    () => sessions.filter((s) => s.isCurrent).length,
    [sessions]
  );

  const logoutableSessions = useMemo(
    () => sessions.filter((s) => !s.isCurrent),
    [sessions],
  );

  const selectedCount = selectedIds.length;
  const allLogoutableSelected =
    logoutableSessions.length > 0 &&
    selectedIds.length === logoutableSessions.length;

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

  const handleLogout = async () => {
    try {
      const res = await AccountApiRequest.logoutSessions(selectedIds);
      if (res?.payload?.success) {
        toast.success(res.payload.message, {
          style: {
            "--normal-bg": "light-dark(var(--color-green-600), var(--color-green-400))",
            "--normal-text": "var(--color-white)",
          } as React.CSSProperties,
        });

        setSessions(sessions.filter((s) => !selectedIds.includes(s.id)));
      }
      else {
        toast.error(res?.payload?.message, {
          style: {
            "--normal-bg": "light-dark(var(--color-red-600), var(--color-red-400))",
            "--normal-text": "var(--color-white)",
          } as React.CSSProperties,
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  useEffect(() => {
    if (!open) return;
    void loadSessions();
  }, [open, loadSessions]);

  useEffect(() => {
    if (!open) return;
    // reset selection when dialog opens
    setSelectedIds([]);
    setConfirmLogoutOpen(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Login sessions</DialogTitle>
          <DialogDescription>
            Bạn có thể chọn các session (không phải current session) và logout.
            Current sessions: {currentCount}
          </DialogDescription>

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

            <Button
              variant="destructive"
              size="sm"
              className="gap-2 ml-2"
              disabled={selectedCount === 0}
              onClick={
                handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout selected ({selectedCount})
            </Button>
          </div>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Không tải được sessions</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Logout selected sessions?</AlertDialogTitle>
              <AlertDialogDescription>
                UI mẫu: thao tác này chỉ là giao diện, chưa gọi API logout thật.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  // UI only: clear selection after "logout"
                  setSelectedIds([]);
                  setConfirmLogoutOpen(false);
                }}
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ScrollArea className="max-h-[55vh] pr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[52px]">
                  <Checkbox
                    checked={allLogoutableSelected}
                    onCheckedChange={(checked) => {
                      const nextChecked = Boolean(checked);
                      setSelectedIds(
                        nextChecked ? logoutableSessions.map((s) => s.id) : [],
                      );
                    }}
                    aria-label="Select all logoutable sessions"
                    disabled={logoutableSessions.length === 0}
                  />
                </TableHead>
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
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
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
                    colSpan={6}
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
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(s.id)}
                        onCheckedChange={(checked) => {
                          const nextChecked = Boolean(checked);
                          setSelectedIds((prev) => {
                            if (nextChecked) {
                              return prev.includes(s.id) ? prev : [...prev, s.id];
                            }
                            return prev.filter((x) => x !== s.id);
                          });
                        }}
                        disabled={s.isCurrent}
                        aria-label={`Select session ${s.id}`}
                      />
                    </TableCell>
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

