"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  BanIcon,
  CheckCircleIcon,
  CircleHelpIcon,
  CircleMinusIcon,
  MailIcon,
  MarsIcon,
  VenusIcon,
} from "lucide-react";
import { StaffApiRequest } from "@/api-request/staff";
import { handleErrorApi } from "@/lib/utils";
import type { AdminAccount } from "@/types/account";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function sexBadge(sex?: number) {
  if (sex === 1) {
    return (
      <Badge className="border-none bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
        <MarsIcon className="size-3" />
        Male
      </Badge>
    );
  }
  if (sex === 2) {
    return (
      <Badge className="border-none bg-rose-600/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
        <VenusIcon className="size-3" />
        Female
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <CircleHelpIcon className="size-3" />
      Unknown
    </Badge>
  );
}

function statusBadge(status?: number) {
  if (status === 1) {
    return (
      <Badge className="border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400">
        <CheckCircleIcon className="size-3" />
        Active
      </Badge>
    );
  }
  if (status === 0) {
    return (
      <Badge className="border-none bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400">
        <CircleMinusIcon className="size-3" />
        Inactive
      </Badge>
    );
  }
  if (status === -1) {
    return (
      <Badge variant="destructive">
        <BanIcon className="size-3" />
        Banned
      </Badge>
    );
  }
  if (status === 2) {
    return (
      <Badge className="border-none bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
        <MailIcon className="size-3" />
        Email not verified
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <CircleHelpIcon className="size-3" />
      Unknown
    </Badge>
  );
}

function roleText(role?: number) {
  if (role === 1) return "Admin";
  if (role === 2) return "Seller";
  if (role === 3) return "Warehouse";
  if (role === 0) return "User";
  return "Unknown";
}

function valueOrDash(value?: string | number | null) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string" && value.trim() === "") return "-";
  return String(value);
}

export function StaffDetailView({ id }: { id: string }) {
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await StaffApiRequest.getStaffDetail(id);
        if (!res || !res.payload.success) {
          handleErrorApi({ error: res?.payload ?? { message: "Failed to load staff detail" } });
          return;
        }
        setAccount(res.payload.data);
      } catch (error) {
        handleErrorApi({ error });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const fullName = useMemo(() => {
    return [account?.firstName, account?.lastName].filter(Boolean).join(" ") || "-";
  }, [account?.firstName, account?.lastName]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading staff detail...</div>;
  }

  if (!account) {
    return <div className="text-sm text-destructive">Staff account not found.</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={account.avatarUrl || undefined} alt={account.email} />
              <AvatarFallback>
                {(account.firstName?.[0] ?? account.email?.[0] ?? "?").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{fullName}</div>
              <div className="text-sm text-muted-foreground">{account.email}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusBadge(account.status)}
            {sexBadge(account.sex)}
            <Badge variant="secondary">{roleText(account.role)}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Detail information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{valueOrDash(account.email)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{valueOrDash(account.phone)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="font-medium">{valueOrDash(account.address)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date of Birth</p>
            <p className="font-medium">
              {account.dateOfBirth ? dayjs(account.dateOfBirth).format("DD/MM/YYYY") : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created At</p>
            <p className="font-medium">
              {account.createdAt ? dayjs(account.createdAt).format("DD/MM/YYYY HH:mm") : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Updated At</p>
            <p className="font-medium">
              {account.updatedAt ? dayjs(account.updatedAt).format("DD/MM/YYYY HH:mm") : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Login</p>
            <p className="font-medium">
              {account.lastLoginAt ? dayjs(account.lastLoginAt).format("DD/MM/YYYY HH:mm") : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ID</p>
            <p className="font-mono text-xs">{valueOrDash(account._id)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
