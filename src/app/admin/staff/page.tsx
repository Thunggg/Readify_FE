import AccountsTable from "./accounts-table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Link from "next/link";

export default async function AccountsPage() {

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff</h2>
          <p className="text-muted-foreground">
            Create, update, and manage staff
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/staff/trash">
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
          </Link>
        </Button>
      </div>

      <AccountsTable />
    </div>
  );
}