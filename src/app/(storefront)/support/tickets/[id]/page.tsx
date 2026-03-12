import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LifeBuoy, MessageSquare, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TicketStatusBadge } from "../components/ticket-status-badge";

export const metadata: Metadata = {
  title: "Ticket detail - Readify",
  description: "Chi tiết support ticket (UI mẫu).",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <LifeBuoy className="size-5" />
              <span className="text-sm">Support</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-balance">
              Ticket #{id}
            </h1>
            <p className="text-muted-foreground mt-2">
              UI mẫu cho màn hình chi tiết ticket.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <TicketStatusBadge status="WAITING_ADMIN" />
            <Button variant="outline" asChild>
              <Link href="/support/tickets">
                <ArrowLeft className="mr-2 size-4" />
                Quay lại danh sách
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-primary" />
                  <CardTitle>Trao đổi</CardTitle>
                </div>
                <CardDescription>
                  Danh sách message chỉ là placeholder (không có dữ liệu thật).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border bg-background p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">CUSTOMER • you</span>
                    <span>12/03/2026 09:05</span>
                  </div>
                  <div className="mt-2 text-sm">
                    Mình không áp dụng được mã giảm giá SAVE10 khi checkout. Nhờ
                    admin kiểm tra giúp.
                  </div>
                </div>

                <div className="rounded-md border bg-muted/40 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">STAFF • admin</span>
                    <span>12/03/2026 09:18</span>
                  </div>
                  <div className="mt-2 text-sm">
                    Mình đã nhận thông tin. Bạn cho mình xin mã đơn hàng và ảnh
                    chụp màn hình lỗi nhé.
                  </div>
                </div>

                <Separator />

                <div className="rounded-md border bg-background p-4">
                  <div className="text-sm font-medium mb-2">Reply (UI mẫu)</div>
                  <textarea
                    className="border-input dark:bg-input/30 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    placeholder="Nhập phản hồi..."
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <Button variant="outline" type="button" className="gap-2">
                      <Paperclip className="size-4" />
                      Đính kèm
                    </Button>
                    <Button type="button">Gửi</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin ticket</CardTitle>
                <CardDescription>Placeholder meta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="font-medium truncate max-w-48">
                    Mã giảm giá không hoạt động
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">12/03/2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last message</span>
                  <span className="font-medium">09:18</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gợi ý</CardTitle>
                <CardDescription>UI mẫu.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                  <li>Đính kèm ảnh/video nếu có lỗi hiển thị.</li>
                  <li>Không chia sẻ mật khẩu/OTP.</li>
                  <li>Thêm mã đơn hàng để admin tra cứu nhanh.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

