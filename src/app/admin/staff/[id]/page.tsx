import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { StaffDetailView } from "./staff-detail-view";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Detail</h2>
          <p className="text-muted-foreground">Thông tin chi tiết tài khoản staff</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/staff">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Staff
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/staff/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Account
            </Link>
          </Button>
        </div>
      </div>

      <StaffDetailView id={id} />
    </div>
  );
}
