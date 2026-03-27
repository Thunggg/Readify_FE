"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { OrderApiRequest } from "@/api-request/order-request";
import { CartApiRequest } from "@/api-request/cart";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";
import { Loader2, ChevronLeft } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await OrderApiRequest.getOrderHistory({
        limit: 50,
        order: "desc",
        sortBy: "createdAt",
      });
      const payload = res?.payload as any;
      if (payload?.data?.items) {
        setOrders(payload.data.items);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await OrderApiRequest.cancelOrder(orderId);
      const payload = res?.payload as any;
      if (payload?.statusCode === 200) {
        toast.success("Hủy đơn hàng thành công");
        fetchOrders();
      } else {
        toast.error(payload?.message || "Hủy đơn hàng thất bại");
      }
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      setReorderingId(order._id);
      for (const item of order.items) {
        await CartApiRequest.addToCart({
          bookId: item.bookId,
          quantity: item.quantity,
        });
      }
      toast.success("Đã thêm vào giỏ hàng");
      router.push("/checkout");
    } catch (error) {
      handleErrorApi({ error });
      setReorderingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "text-xs px-2 py-1";
    switch (status) {
      case "PENDING":
        return (
          <Badge className={`${base} bg-yellow-500/90`}>Chờ xác nhận</Badge>
        );
      case "CONFIRMED":
        return <Badge className={`${base} bg-blue-500/90`}>Đã xác nhận</Badge>;
      case "DELIVERED":
        return <Badge className={`${base} bg-indigo-500/90`}>Đã giao</Badge>;
      case "COMPLETED":
        return <Badge className={`${base} bg-green-600`}>Hoàn tất</Badge>;
      case "CANCELLED":
        return <Badge className={`${base} bg-red-500`}>Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-400">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container max-w-4xl">
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-4xl space-y-6">
        <Link
          href="/profile"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </Link>

        <div>
          <h1 className="text-xl font-semibold">Đơn hàng của tôi</h1>
          <p className="text-sm text-muted-foreground">
            {orders.length} đơn hàng
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Bạn chưa có đơn hàng nào
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="border">
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">#{order.orderCode}</p>
                    <p className="text-xs text-muted-foreground">
                      {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="divide-y">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">{item.bookId}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.quantity} x {item.unitPrice.toLocaleString()}đ
                          </p>
                        </div>
                        <p className="font-medium">
                          {item.subtotal.toLocaleString()}đ
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-sm font-semibold">
                        {order.finalAmount.toLocaleString()}đ
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.paymentMethod === "COD" ? "COD" : "VNPAY"} •{" "}
                        {order.paymentStatus === "PAID"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/profile/orders/${order._id}`}>
                        <Button size="sm" variant="outline">
                          Chi tiết
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(order)}
                        disabled={reorderingId === order._id}
                      >
                        {reorderingId === order._id && (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        Đặt lại
                      </Button>

                      {(order.status === "PENDING" ||
                        order.status === "CONFIRMED") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Hủy
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
