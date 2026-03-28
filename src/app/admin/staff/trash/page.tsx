import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AccountsTable from "../accounts-table";

export default function StaffTrashPage() {
  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Trash</h2>
          <p className="text-muted-foreground">List of deleted staff accounts</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/staff">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staff
          </Link>
        </Button>
      </div>

      <AccountsTable deletedOnly />
    </div>
  );
}
