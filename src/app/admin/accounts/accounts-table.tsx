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
import { Plus } from "lucide-react";
import CreateAccountModal from "./components/create-account-modal";


export default function AccountsTable({ accounts }: { accounts: AdminAccount[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [localAccounts, setLocalAccounts] = useState<AdminAccount[]>(accounts);


  const sexLabel = (sex: number) => {
    if(sex === 1) return "Male";
    if(sex === 2) return "Female";
    return "Unknown";
  }

  const statusLabel = (status: number) => {
    if(status === 1) return "Active";
    if(status === 0) return "Inactive";
    if(status === -1) return "Banned";
    if(status === 2) return "Email not verified";
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
              <TableCell>{account.email}</TableCell>
              <TableCell>{`${account.firstName} ${account.lastName}`}</TableCell>
              <TableCell>{account.phone}</TableCell>
              <TableCell>
                {account.dateOfBirth ? dayjs(account.dateOfBirth).format("DD/MM/YYYY") : "-"}
              </TableCell>
              <TableCell>{sexLabel(Number(account.sex))}</TableCell>
              <TableCell>{statusLabel(Number(account.status))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>{" "}
    </>
  );
}