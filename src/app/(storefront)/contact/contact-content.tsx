"use client";

import Link from "next/link";
import { ArrowLeft, Clock, FileText, Send, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TicketApiRequest } from "@/api-request/ticket";
import { handleErrorApi } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import z from "zod";

export default function NewSupportTicketPage() {
  const contactSchema = z.object({
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(200, "Max 200 characters"),
    message: z
      .string()
      .min(1, "Message is required")
      .max(1000, "Max 1000 characters"),
  });

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof contactSchema>) {
    try {
      const response = await TicketApiRequest.createTicket(
        values.subject,
        values.message,
      );

      toast.success(response?.payload.message ?? "Created ticket", {
        style: {
          "--normal-bg": "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-text": "var(--color-white)",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });

      form.reset();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, duration: 5000 });
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-foreground">Hỗ trợ</span>
          </div>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-balance">
                Gửi yêu cầu hỗ trợ
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Tạo một support ticket để đội ngũ admin hỗ trợ bạn nhanh chóng.
                Bạn có thể đính kèm hình ảnh/hoá đơn để mô tả vấn đề rõ hơn.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  <CardTitle>Tạo ticket mới</CardTitle>
                </div>
                <CardDescription>
                  Vui lòng điền đầy đủ thông tin bên dưới. Các trường có dấu *
                  là bắt buộc.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiêu đề (Subject) *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ví dụ: Không nhận được email xác nhận đơn hàng"
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nội dung *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={
                                "Mô tả chi tiết vấn đề của bạn:\n- Bạn đang làm gì?\n- Bạn mong đợi điều gì?\n- Lỗi xảy ra như thế nào?"
                              }
                              rows={8}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="justify-between gap-3">
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ArrowLeft className="mr-2 size-4" />
                    Quay lại
                  </Link>
                </Button>
                <Button
                  type="submit"
                  className="cursor-pointer"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={form.formState.isSubmitting}
                >
                  <Send className="mr-2 size-4" />
                  Gửi ticket
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-primary" />
                  <CardTitle>Thời gian phản hồi</CardTitle>
                </div>
                <CardDescription>
                  Đây là UI mẫu. Bạn có thể chỉnh lại theo SLA thực tế.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ưu tiên thường</span>
                  <span className="font-medium">Trong 24h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ưu tiên cao</span>
                  <span className="font-medium">Trong 8h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Khẩn cấp</span>
                  <span className="font-medium">Trong 2h</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <CardTitle>Mẹo để xử lý nhanh</CardTitle>
                </div>
                <CardDescription>
                  Càng rõ ràng, admin càng hỗ trợ nhanh.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>Ghi rõ bước thực hiện và màn hình bạn đang ở.</li>
                  <li>Đính kèm ảnh/video nếu có lỗi hiển thị.</li>
                  <li>Với đơn hàng, hãy thêm mã đơn hàng (Order ID).</li>
                  <li>
                    Tránh chia sẻ mật khẩu/OTP. Nếu cần, chỉ cung cấp 4 số cuối
                    của thẻ/hoá đơn.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ví dụ nội dung tốt</CardTitle>
                <CardDescription>Mẫu để bạn copy cho nhanh.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-background p-3 text-sm">
                  <div className="font-medium mb-2">Tiêu đề:</div>
                  <div className="text-muted-foreground">
                    Không áp dụng được mã giảm giá khi checkout
                  </div>
                  <div className="font-medium mt-4 mb-2">Nội dung:</div>
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {`- Mã: SAVE10
- Bước: Vào giỏ hàng → Checkout → nhập mã
- Kết quả: báo “invalid code”
- Mong đợi: giảm 10% như quảng cáo
- Thời gian: 10:15 12/03/2026`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

