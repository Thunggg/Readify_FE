"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import dayjs from "dayjs";
import { OrderApiRequest } from "@/api-request/order-request";
import { CartApiRequest } from "@/api-request/cart";
import { BookApiRequest } from "@/api-request/book";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await OrderApiRequest.getOrderById(orderId);
        const payload = res?.payload as any;
        if (payload?.data) {
          const fetchedOrder = payload.data;
          
          try {
            const enrichedItems = await Promise.all(
              fetchedOrder.items.map(async (item: any) => {
                if (typeof item.bookId === 'string') {
                  try {
                    const bookRes = await BookApiRequest.getById(item.bookId);
                    const bookData = (bookRes as any)?.payload?.data || (bookRes as any)?.data;
                    if (bookData) {
                      return { ...item, bookDetails: bookData };
                    }
                  } catch (err) {
                    console.error("Failed to fetch book", item.bookId);
                  }
                }
                return item;
              })
            );
            fetchedOrder.items = enrichedItems;
          } catch (err) {}
          
          setOrder(fetchedOrder);
        } else {
          toast.error("Không thể tải thông tin đơn hàng");
        }
      } catch (error) {
        handleErrorApi({ error });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleReorder = async () => {
    if (!order) return;

    try {
      setReordering(true);

      // Add all items from this order to cart
      for (const item of order.items) {
        await CartApiRequest.addToCart({
          bookId: item.bookId,
          quantity: item.quantity,
        });
      }

      toast.success("Đã thêm tất cả sản phẩm vào giỏ hàng");

      // Redirect to checkout
      router.push("/checkout");
    } catch (error) {
      handleErrorApi({ error });
    } finally {
      setReordering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500">Chờ xác nhận</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-blue-500">Đã xác nhận</Badge>;
      case "DELIVERED":
        return <Badge className="bg-indigo-500">Đã giao hàng</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500">Hoàn tất</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    return status === "PAID" ? (
      <Badge className="bg-green-500">Đã thanh toán</Badge>
    ) : (
      <Badge className="bg-orange-500">Chưa thanh toán</Badge>
    );
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/profile" className="text-primary hover:underline">
            <ChevronLeft className="inline h-4 w-4 mr-1" />
            Quay lại
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/profile" className="text-primary hover:underline">
            <ChevronLeft className="inline h-4 w-4 mr-1" />
            Quay lại
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy đơn hàng
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/profile" className="text-primary hover:underline">
          <ChevronLeft className="inline h-4 w-4 mr-1" />
          Quay lại
        </Link>
      </div>

      <div className="space-y-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Đơn hàng #{order.orderCode}
                </CardTitle>
                <CardDescription>
                  Đặt hàng: {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-col items-end">
                {getStatusBadge(order.status)}
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm đặt hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => {
                const isBookObject = typeof item.bookId === "object" && item.bookId !== null;
                const bookData: any = isBookObject ? item.bookId : item.bookDetails;
                const bookTitle = bookData?.title || bookData?.name || `Mã sách: ${isBookObject ? bookData._id : item.bookId}`;
                const bookImage = bookData?.thumbnailUrl || bookData?.images?.[0]?.url;

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      {bookImage && (
                        <div className="h-24 w-16 md:h-28 md:w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={bookImage}
                            alt={bookTitle}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-base md:text-lg line-clamp-2" title={bookTitle}>
                          {bookTitle}
                        </p>
                        {isBookObject && bookData?.authors && bookData.authors.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            Tác giả: {bookData.authors.map((a: any) => a.name).join(", ")}
                          </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-sm">
                          <p>
                            Số lượng:{" "}
                            <span className="font-semibold">{item.quantity}</span>
                          </p>
                          <p>
                            Đơn giá:{" "}
                            <span className="font-semibold text-muted-foreground">
                              {item.unitPrice.toLocaleString()}đ
                            </span>
                          </p>
                          <p className="md:text-right">
                            Thành tiền:{" "}
                            <span className="font-semibold text-primary">
                              {item.subtotal.toLocaleString()}đ
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Địa chỉ:</span>
                  <br />
                  <span className="font-semibold">{order.shippingAddress}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Phương thức:</span>
                  <br />
                  <span className="font-semibold">
                    {order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : "Thanh toán VNPAY"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiền hàng:</span>
                <span className="font-semibold">
                  {(order.totalAmount + order.discountAmount).toLocaleString()}đ
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-muted-foreground">Giảm giá:</span>
                  <span className="font-semibold">
                    -{order.discountAmount.toLocaleString()}đ
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-primary">
                  {order.finalAmount.toLocaleString()}đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Note */}
        {order.note && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ghi chú đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.note}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/profile">
            <Button variant="outline">Quay lại danh sách</Button>
          </Link>
          <Button onClick={handleReorder} disabled={reordering}>
            {reordering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {reordering ? "Đang xử lý..." : "Đặt lại đơn hàng"}
          </Button>
        </div>
      </div>
    </div>
  );
}
