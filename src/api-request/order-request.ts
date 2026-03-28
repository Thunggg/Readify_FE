import http from "@/lib/http";
import { ApiResponse } from "@/types/api";
import type {
  Order,
  SearchOrderDto,
  PaginatedOrderResponse,
  UpdateOrderDto,
  CreateOrderDto,
} from "@/types/order";

export const OrderApiRequest = {
  // 1. Lấy danh sách tất cả đơn hàng (Dành cho Admin)
  getOrders: async (query: SearchOrderDto = {}) => {
    // Sử dụng URLSearchParams để gắn các biến ?status=...&page=... một cách tự động
    const params = new URLSearchParams();

    if (query.q) params.append("q", query.q);
    if (query.status) params.append("status", query.status);
    if (query.paymentMethod)
      params.append("paymentMethod", query.paymentMethod);
    if (query.paymentStatus)
      params.append("paymentStatus", query.paymentStatus);
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.order) params.append("order", query.order);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());

    // Chuyển params thành chuỗi (ví dụ: "page=1&limit=10")
    const queryString = params.toString();
    const url = `/orders${queryString ? `?${queryString}` : ""}`;

    // Gọi HTTP GET request tới backend
    const response = await http.get<ApiResponse<PaginatedOrderResponse>>(url, {
      credentials: "include",
      cache: "no-store", // Quan trọng: Đảm bảo không lấy dữ liệu cũ đã bị lưu cache
    });
    return response;
  },

  // 2. Lấy chi tiết một đơn hàng theo ID
  getOrderById: async (id: string) => {
    const response = await http.get<ApiResponse<Order>>(`/orders/${id}`, {
      credentials: "include",
    });
    return response;
  },

  // 3. Cập nhật thông tin đơn hàng (ví dụ: từ PENDING đổi sang CONFIRMED)
  updateOrder: async (id: string, data: UpdateOrderDto) => {
    const response = await http.put<ApiResponse<Order>>(`/orders/${id}`, data, {
      credentials: "include",
    });
    return response;
  },

  // --- PHẦN DÀNH CHO KHÁCH HÀNG (CUSTOMER) ---

  // 4. Lấy lịch sử đơn hàng của người dùng hiện tại
  getOrderHistory: async (query: SearchOrderDto = {}) => {
    const params = new URLSearchParams();

    if (query.q) params.append("q", query.q);
    if (query.status) params.append("status", query.status);
    if (query.paymentMethod)
      params.append("paymentMethod", query.paymentMethod);
    if (query.paymentStatus)
      params.append("paymentStatus", query.paymentStatus);
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.order) params.append("order", query.order);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());

    const queryString = params.toString();
    const url = `/orders/history${queryString ? `?${queryString}` : ""}`;

    const response = await http.get<ApiResponse<PaginatedOrderResponse>>(url, {
      credentials: "include",
      cache: "no-store",
    });
    return response;
  },

  // 5. Tạo đơn hàng (Khách hàng)
  createOrder: async (data: CreateOrderDto) => {
    const response = await http.post<ApiResponse<Order>>("/orders", data, {
      credentials: "include",
    });
    return response;
  },

  // 6. Hủy đơn hàng (Chỉ đơn hàng PENDING hoặc CONFIRMED)
  cancelOrder: async (id: string) => {
    const response = await http.patch<ApiResponse<Order>>(
      `/orders/${id}/cancel`,
      {},
      {
        credentials: "include",
      },
    );
    return response;
  },
};
