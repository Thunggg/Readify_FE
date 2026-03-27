import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng - BookStore",
  description: "Xem chi tiết và đặt lại đơn hàng",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
