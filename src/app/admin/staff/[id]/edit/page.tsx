import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditStaffForm } from "./edit-staff-form";

export default async function StaffEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Staff</h2>
          <p className="text-muted-foreground">Update staff account information</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/staff/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Detail
          </Link>
        </Button>
      </div>

      <EditStaffForm id={id} />
    </div>
  );
}
