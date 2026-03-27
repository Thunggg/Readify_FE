// Định nghĩa các loại dữ liệu cơ bản cho đơn hàng (Order) để dễ quản lý trong TypeScript

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentMethod = "COD" | "VNPAY";
export type PaymentStatus = "UNPAID" | "PAID";

// Thông tin từng sản phẩm trong đơn hàng
export interface OrderItem {
  bookId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Thông tin chi tiết của một đơn hàng (Dựa trên hướng dẫn API)
export interface Order {
  _id: string;
  orderCode: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  promotionId?: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Tham số để lọc (filter) và phân trang (pagination) khi lấy danh sách đơn hàng
export interface SearchOrderDto {
  q?: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Dữ liệu dùng để cập nhật đơn hàng
export interface UpdateOrderDto {
  shippingAddress?: string;
  status?: OrderStatus;
}

// Dữ liệu dùng để tạo mới đơn hàng
export interface CreateOrderDto {
  selectedCartItemIds: string[];
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  promotionCode?: string;
  note?: string;
}

// Cấu trúc phân trang mà backend trả ra
export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Kết quả trả về chứa cả danh sách đơn hàng và thông tin phân trang
export interface PaginatedOrderResponse {
  items: Order[];
  pagination: OrderPagination;
}
