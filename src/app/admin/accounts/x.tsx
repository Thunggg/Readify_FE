"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Trash2,
  TriangleAlert,
  UserPen,
} from "lucide-react";

import http from "@/lib/http";
import type { ApiPaginatedResponse, ApiResponse, PaginationMeta } from "@/types/api";
import type { AdminAccount } from "@/types/account";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type AccountUpsertPayload = {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  role?: number;
  status?: number;
};

function getId(a: AdminAccount) {
  return a._id || a.id || "";
}

function roleLabel(role?: number) {
  if (role === 1) return "Admin";
  if (role === 2) return "Seller";
  if (role === 3) return "Warehouse";
  if (role === 0) return "Customer";
  return role === undefined ? "—" : String(role);
}

function statusLabel(status?: number) {
  if (status === 1) return "Active";
  if (status === 0) return "Inactive";
  if (status === -1) return "Banned";
  if (status === 2) return "Email not verified";
  return status === undefined ? "—" : String(status);
}

function extractPaginated(payload: ApiPaginatedResponse<AdminAccount>["data"] | any) {
  const items: AdminAccount[] = payload?.items ?? [];
  const pagination: PaginationMeta | null = payload?.meta ?? payload?.pagination ?? null;
  return { items, pagination };
}

export default function AccountsTable({
  initialAccounts,
  initialPagination,
  initialError,
}: {
  initialAccounts: AdminAccount[];
  initialPagination: PaginationMeta | null;
  initialError: string | null;
}) {
  const [accounts, setAccounts] = useState<AdminAccount[]>(initialAccounts);
  const [pagination, setPagination] = useState<PaginationMeta | null>(initialPagination);
  const [page, setPage] = useState<number>(initialPagination?.page ?? 1);
  const [limit, setLimit] = useState<number>(initialPagination?.limit ?? 10);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);

  const [form, setForm] = useState<AccountUpsertPayload>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    role: 1,
    status: 1,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => {
      const email = (a.email ?? "").toLowerCase();
      const name = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim().toLowerCase();
      const phone = (a.phone ?? "").toLowerCase();
      return email.includes(q) || name.includes(q) || phone.includes(q);
    });
  }, [accounts, query]);

  const openCreate = () => {
    setError(null);
    setForm({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      role: 1,
      status: 1,
    });
    setCreateOpen(true);
  };

  const openEdit = (acc: AdminAccount) => {
    setError(null);
    setEditing(acc);
    setForm({
      email: acc.email ?? "",
      password: "",
      firstName: acc.firstName ?? "",
      lastName: acc.lastName ?? "",
      phone: acc.phone ?? "",
      address: acc.address ?? "",
      role: acc.role ?? 1,
      status: acc.status ?? 1,
    });
    setEditOpen(true);
  };

  const fetchPage = async (nextPage: number, nextLimit = limit) => {
    try {
      setBusy(true);
      setError(null);
      const qs = new URLSearchParams();
      qs.set("page", String(nextPage));
      qs.set("limit", String(nextLimit));
      const url = `/accounts?${qs.toString()}`;

      const res = await http.get<ApiPaginatedResponse<AdminAccount>>(url, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.payload.success) {
        setError(res.payload.data.message);
        toast.error("Load failed", { description: res.payload.data.message });
        return;
      }

      const extracted = extractPaginated(res.payload.data);
      setAccounts(extracted.items);
      setPagination(extracted.pagination);
      setPage(extracted.pagination?.page ?? nextPage);
      setLimit(extracted.pagination?.limit ?? nextLimit);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load accounts";
      setError(msg);
      toast.error("Load failed", { description: msg });
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => fetchPage(page, limit);

  const createAccount = async () => {
    if (!form.email.trim()) {
      const msg = "Email is required";
      setError(msg);
      toast.error("Create failed", { description: msg });
      return;
    }
    if (!form.password?.trim()) {
      const msg = "Password is required";
      setError(msg);
      toast.error("Create failed", { description: msg });
      return;
    }

    try {
      setBusy(true);
      setError(null);
      const res = await http.post<ApiResponse<any>>(
        "/accounts",
        { ...form, email: form.email.trim(), password: form.password },
        { credentials: "include" }
      );

      if (!res.payload.success) {
        setError(res.payload.data.message);
        toast.error("Create failed", { description: res.payload.data.message });
        return;
      }

      toast.success("Account created");
      setCreateOpen(false);
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Create error";
      setError(msg);
      toast.error("Create failed", { description: msg });
    } finally {
      setBusy(false);
    }
  };

  const updateAccount = async () => {
    if (!editing) return;
    const id = getId(editing);
    if (!id) {
      const msg = "Missing account id";
      setError(msg);
      toast.error("Update failed", { description: msg });
      return;
    }

    try {
      setBusy(true);
      setError(null);

      const payload: AccountUpsertPayload = {
        email: form.email.trim(),
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
        role: form.role,
        status: form.status,
      };
      if (form.password?.trim()) payload.password = form.password;

      const res = await http.put<ApiResponse<any>>(`/accounts/${id}`, payload, {
        credentials: "include",
      });

      if (!res.payload.success) {
        setError(res.payload.data.message);
        toast.error("Update failed", { description: res.payload.data.message });
        return;
      }

      toast.success("Account updated");
      setEditOpen(false);
      setEditing(null);
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update error";
      setError(msg);
      toast.error("Update failed", { description: msg });
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async (acc: AdminAccount) => {
    const id = getId(acc);
    if (!id) {
      const msg = "Missing account id";
      setError(msg);
      toast.error("Delete failed", { description: msg });
      return;
    }
    if (!confirm(`Delete account ${acc.email ?? id}?`)) return;

    try {
      setBusy(true);
      setError(null);
      const res = await http.delete<ApiResponse<any>>(`/accounts/${id}`, null, {
        credentials: "include",
      });

      if (!res.payload.success) {
        setError(res.payload.data.message);
        toast.error("Delete failed", { description: res.payload.data.message });
        return;
      }

      toast.success("Account deleted");
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Delete error";
      setError(msg);
      toast.error("Delete failed", { description: msg });
    } finally {
      setBusy(false);
    }
  };

  const totalPages =
    pagination?.totalPages ??
    (pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1);

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="bg-destructive/10 text-destructive border-none">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription className="text-destructive/80">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search (current page)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-[340px]"
          />
          <Button variant="outline" onClick={refresh} disabled={busy}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(v) => fetchPage(1, Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={openCreate} disabled={busy}>
            <Plus className="mr-2 h-4 w-4" />
            New account
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => {
              const id = getId(a);
              const name = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || "—";
              return (
                <TableRow key={id || a.email}>
                  <TableCell className="font-medium">{a.email ?? "—"}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{roleLabel(a.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.status === 1 ? "default" : "secondary"}>
                      {statusLabel(a.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(a)}>
                          <UserPen className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteAccount(a)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => fetchPage(Math.max(1, page - 1), limit)}
                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => fetchPage(Math.min(totalPages, page + 1), limit)}
                className={
                  page >= totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* CREATE */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create account</DialogTitle>
            <DialogDescription>
              Enter account information and assign role/status.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={form.password ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="create-firstName">First name</Label>
                <Input
                  id="create-firstName"
                  value={form.firstName ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-lastName">Last name</Label>
                <Input
                  id="create-lastName"
                  value={form.lastName ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="create-role">Role</Label>
                <Select
                  value={String(form.role ?? 1)}
                  onValueChange={(v) => setForm((s) => ({ ...s, role: Number(v) }))}
                >
                  <SelectTrigger id="create-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Admin</SelectItem>
                    <SelectItem value="3">Warehouse</SelectItem>
                    <SelectItem value="2">Seller</SelectItem>
                    <SelectItem value="0">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={String(form.status ?? 1)}
                  onValueChange={(v) => setForm((s) => ({ ...s, status: Number(v) }))}
                >
                  <SelectTrigger id="create-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                    <SelectItem value="-1">Banned</SelectItem>
                    <SelectItem value="2">Email not verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={createAccount} disabled={busy}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit account</DialogTitle>
            <DialogDescription>
              Update role/status and profile fields. Leave password empty to keep it unchanged.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-password">New password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={form.password ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">First name</Label>
                <Input
                  id="edit-firstName"
                  value={form.firstName ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Last name</Label>
                <Input
                  id="edit-lastName"
                  value={form.lastName ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={String(form.role ?? 1)}
                  onValueChange={(v) => setForm((s) => ({ ...s, role: Number(v) }))}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Admin</SelectItem>
                    <SelectItem value="3">Warehouse</SelectItem>
                    <SelectItem value="2">Seller</SelectItem>
                    <SelectItem value="0">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={String(form.status ?? 1)}
                  onValueChange={(v) => setForm((s) => ({ ...s, status: Number(v) }))}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                    <SelectItem value="-1">Banned</SelectItem>
                    <SelectItem value="2">Email not verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={updateAccount} disabled={busy}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}