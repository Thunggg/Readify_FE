'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminAccount } from "@/types/account";
import dayjs from "dayjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BanIcon, CheckCircleIcon, CircleHelpIcon, CircleMinusIcon, EyeIcon, MailIcon, MarsIcon, MoreHorizontalIcon, Plus, VenusIcon } from "lucide-react";
import CreateAccountModal from "./components/create-account-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import UpdateAccountModal from "./components/update-account-modal";
import { Badge } from "@/components/ui/badge";
import DetailAccountDrawer from "./components/detail-account-drawer";


export default function AccountsTable({ accounts }: { accounts: AdminAccount[] }) {
  const [createOpen, setCreateOpen] = useState(false); // Đóng mở modal tạo tài khoản
  const [showUpdateDialog, setShowUpdateDialog] = useState(false); // Đóng mở modal cập nhật tài khoản
  const [, setShowDeleteDialog] = useState(false); // Đóng mở popup xóa tài khoản
  const [showDetailAccount, setShowDetailAccount] = useState(false); // Đóng mở drawer chi tiết tài khoản
  const [localAccounts, setLocalAccounts] = useState<AdminAccount[]>(accounts); // Danh sách tài khoản trong local
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null); // Tài khoản được chọn để cập nhật hoặc xem chi tiết


  const sexLabel = (sex: number) => {
  if (sex === 1) {
    return (
      <Badge
        className="
          border-none
          bg-blue-600/10 text-blue-600
          dark:bg-blue-400/10 dark:text-blue-400
        "
      >
        <MarsIcon className="size-3" />
        Male
      </Badge>
    );
  }

  if (sex === 2) {
    return (
      <Badge
        className="
          border-none
          bg-rose-600/10 text-rose-600
          dark:bg-rose-400/10 dark:text-rose-400
        "
      >
        <VenusIcon className="size-3" />
        Female
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-muted-foreground"
    >
      <CircleHelpIcon className="size-3" />
      Unknown
    </Badge>
  );
  };


  const statusLabel = (status: number) => {
    if(status === 1){
      return (
        <>
          <Badge className="border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">
            <CheckCircleIcon className="size-3" />
            Active
          </Badge>
        </>
      );
      
    }
    if(status === 0){
      return (
        <>
          <Badge className="border-none bg-red-600/10 text-red-600 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5">
            <CircleMinusIcon className="size-3" />
            Inactive
          </Badge>
        </>
      );
    };
    if(status === -1){
      return (
        <>
          <Badge variant="destructive">
            <BanIcon className="size-3" />
            Banned
          </Badge>
        </>
      );
    }
    if(status === 2){
      return (
        <>
          <Badge className="border-none bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5">
            <MailIcon className="size-3" />
            Email not verified
          </Badge>
        </>
      );
    }
    return "Unknown";
  }

  return (
    <>
      <Button onClick={() => setCreateOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create account
      </Button>
      <CreateAccountModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreateAccount={(data) => {
          {
            setLocalAccounts([...localAccounts, data]);
          }
        }}
      />
      <UpdateAccountModal
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        selectedAccount={selectedAccount}
        onUpdateAccount={(data) => {
          setLocalAccounts(localAccounts.map((account) => account._id === data._id ? data : account));
        }}
      />
      <DetailAccountDrawer
        open={showDetailAccount}
        onOpenChange={setShowDetailAccount}
        selectedAccount={selectedAccount}
      />
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Full name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localAccounts.map((account) => (
            <TableRow key={account._id}>
              <TableCell>
                <Avatar>
                  <AvatarImage
                    alt={account.firstName}
                    src={account.avatarUrl}
                  />
                  <AvatarFallback>
                    {account.firstName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell
              className="cursor-pointer"
              onClick={() => {
                setShowDetailAccount(true);
                setSelectedAccount(account);
              }}
              >{account.email}</TableCell>
              <TableCell>{`${account.firstName} ${account.lastName}`}</TableCell>
              <TableCell>{account.phone}</TableCell>
              <TableCell>
                {account.dateOfBirth
                  ? dayjs(account.dateOfBirth).format("DD/MM/YYYY")
                  : "-"}
              </TableCell>
              <TableCell>{sexLabel(Number(account.sex))}</TableCell>
              <TableCell>{statusLabel(Number(account.status))}</TableCell>
              <TableCell>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      aria-label="Open menu"
                      size="icon-sm"
                    >
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => {
                        setShowUpdateDialog(true);
                        setSelectedAccount(account);
                      }}>
                        Edit Account
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setShowDeleteDialog(true);
                          setSelectedAccount(account);
                        }}
                      >
                        Delete Account
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>{" "}
    </>
  );
}