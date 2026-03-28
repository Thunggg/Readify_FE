"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { OrderApiRequest } from "@/api-request/order-request";
import { CartApiRequest } from "@/api-request/cart";
import { BookApiRequest } from "@/api-request/book";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function ProfileOrders() {
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
        const fetchedOrders = payload.data.items;

        try {
          const enrichedOrders = await Promise.all(
            fetchedOrders.map(async (order: any) => {
              if (order.items && order.items.length > 0) {
                const firstItem = order.items[0];
                if (typeof firstItem.bookId === "string") {
                  try {
                    const bookRes = await BookApiRequest.getById(firstItem.bookId);
                    const bookData = (bookRes as any)?.payload?.data || (bookRes as any)?.data;
                    if (bookData) {
                      firstItem.bookDetails = bookData;
                    }
                  } catch (e) { }
                }
              }
              return order;
            })
          );
          setOrders(enrichedOrders);
        } catch (e) {
          setOrders(fetchedOrders);
        }
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

      toast.success("Đã thêm các sản phẩm vào giỏ hàng");
      router.push("/cart");
    } catch (error) {
      handleErrorApi({ error });
      setReorderingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "text-xs px-2 py-0.5 rounded text-white shadow-none font-medium";
    switch (status) {
      case "PENDING":
        return <Badge className={`${base} bg-yellow-500 hover:bg-yellow-600`}>Chờ xác nhận</Badge>;
      case "CONFIRMED":
        return <Badge className={`${base} bg-blue-500 hover:bg-blue-600`}>Đã xác nhận</Badge>;
      case "DELIVERED":
        return <Badge className={`${base} bg-indigo-500 hover:bg-indigo-600`}>Đã giao</Badge>;
      case "COMPLETED":
        return <Badge className={`${base} bg-green-500 hover:bg-green-600`}>Hoàn tất</Badge>;
      case "CANCELLED":
        return <Badge className={`${base} bg-red-500 hover:bg-red-600`}>Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-400">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đơn hàng</CardTitle>
          <CardDescription>Đang tải danh sách đơn hàng...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1 border-b pb-4">
        <CardTitle className="text-xl font-bold">Lịch sử đơn hàng</CardTitle>
        <CardDescription>
          Quản lý và theo dõi các đơn hàng của bạn ({orders.length})
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-muted-foreground text-2xl">📦</span>
            </div>
            <p className="text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-border rounded-xl bg-card hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Items Summary */}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {(() => {
                      const firstItem = order.items[0];
                      if (!firstItem) return null;
                      const isBookObject = typeof firstItem.bookId === 'object' && firstItem.bookId !== null;
                      const bookData: any = isBookObject ? firstItem.bookId : (firstItem as any).bookDetails;
                      const bookImage = bookData?.thumbnailUrl || bookData?.images?.[0]?.url;
                      const bookTitle = bookData?.title || bookData?.name || "Sản phẩm sách";

                      return (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-14 bg-muted rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden border">
                              {bookImage ? (
                                <img src={bookImage} alt={bookTitle} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-muted-foreground text-[10px] p-1 text-center">Hình sách</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-base line-clamp-1" title={bookTitle}>
                                {bookTitle}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Số lượng: <span className="font-medium text-foreground">{firstItem.quantity}</span>
                              </p>
                              <p className="text-sm text-primary font-medium mt-1">
                                {(firstItem.unitPrice || 0).toLocaleString()}đ
                              </p>
                            </div>
                          </div>
                          <div className="">
                            <div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {order.items.length > 1 && (
                    <div className="mt-3 text-center border-t pt-2">
                      <p className="text-sm text-muted-foreground">
                        ... và {order.items.length - 1} sản phẩm khác
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/10 border-t gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tổng tiền thanh toán</p>
                    <p className="text-lg font-bold text-primary">
                      {order.finalAmount.toLocaleString()}đ
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/profile/orders/${order._id}`}>
                      <Button size="sm" variant="default" className="shadow-none">
                        Xem chi tiết
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder(order)}
                      disabled={reorderingId === order._id}
                    >
                      {reorderingId === order._id && (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      )}
                      Mua lại
                    </Button>

                    {(order.status === "PENDING" ||
                      order.status === "CONFIRMED") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Hủy đơn
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
