import Link from "next/link";
import { LifeBuoy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TicketListTable } from "./components/ticket-list-table";

export default function MyTicketsPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <LifeBuoy className="size-5" />
              <span className="text-sm">Support</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-balance">My Tickets</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Danh sách toàn bộ yêu cầu hỗ trợ bạn đã gửi.
            </p>
          </div>

          <Button asChild className="gap-2">
            <Link href="/contact">
              <Plus className="size-4" />
              Tạo ticket mới
            </Link>
          </Button>
        </div>

        <TicketListTable />
      </div>
    </div>
  );
}

