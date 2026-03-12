import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketListTable} from "./components/ticket-list-table";

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
              Danh sách toàn bộ yêu cầu hỗ trợ bạn đã gửi. Đây là giao diện mẫu,
              chưa có gọi API thật.
            </p>
          </div>

          <Button asChild className="gap-2">
            <Link href="/contact">
              <Plus className="size-4" />
              Tạo ticket mới
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tra cứu</CardTitle>
            <CardDescription>
              UI filter/search mẫu (chưa có logic).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo ticket id hoặc subject..."
                  className="pl-9"
                />
              </div>

              <select
                defaultValue="ALL"
                className="border-input dark:bg-input/30 h-9 w-full sm:w-52 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="OPEN">Open</option>
                <option value="WAITING_ADMIN">Waiting admin</option>
                <option value="WAITING_CUSTOMER">Waiting customer</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <TicketListTable />
      </div>
    </div>
  );
}

