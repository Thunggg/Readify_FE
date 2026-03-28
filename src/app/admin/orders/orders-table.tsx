"use client";

import React, { useState, useEffect } from "react";
import { OrderApiRequest } from "@/api-request/order-request";
import { Order, OrderStatus } from "@/types/order";
import OrderDetailModal from "./order-detail-modal";
import { SearchIcon, FilterIcon } from "lucide-react";

export default function OrdersTable() {
    // State for orders
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const queryParams: any = { page: 1, limit: 50 };
            if (searchQuery) queryParams.q = searchQuery;
            if (statusFilter) queryParams.status = statusFilter;

            const response = await OrderApiRequest.getOrders(queryParams);

            if (response?.payload?.success) {
                setOrders(response.payload.data.items);
            } else {
                setError(response?.payload?.message || "Failed to load orders");
            }
        } catch (err: any) {
            setError("Cannot connect to server: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filters change, typically you'd want a debounce for search but let's keep it simple
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 300); // Simple debounce

        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter]);

    const statusBadge = (status: OrderStatus) => {
        const config: Record<OrderStatus, { label: string; className: string }> = {
            PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
            CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
            DELIVERED: { label: "Delivered", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
            COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
            CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" }
        };
        const st = config[status] || { label: status, className: "bg-gray-100 text-gray-800" };

        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.className}`}>
                {st.label}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {/* Toolbar (Search & Filter) */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-950 p-4 rounded-md border border-gray-200 dark:border-gray-800">
                <div className="flex-1 w-full relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by order code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:max-w-xs pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <FilterIcon className="h-4 w-4 text-gray-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm border border-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800 dark:text-white w-full sm:w-auto"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && <div className="p-4 text-center text-red-500 font-bold bg-red-50 dark:bg-red-900/10 rounded-md">{error}</div>}

            {/* Table wrapper matching promotion style */}
            <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="w-full overflow-auto">
                    <table className="w-full text-sm text-left rtl:text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400">
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th scope="col" className="px-4 py-3 font-medium h-12 align-middle text-muted-foreground">Order Code</th>
                                <th scope="col" className="px-4 py-3 font-medium h-12 align-middle text-muted-foreground">Date</th>
                                <th scope="col" className="px-4 py-3 font-medium h-12 align-middle text-muted-foreground">Original Total</th>
                                <th scope="col" className="px-4 py-3 font-medium h-12 align-middle text-muted-foreground">Discount</th>
                                <th scope="col" className="px-4 py-3 font-medium h-12 align-middle text-muted-foreground">Status</th>
                                <th scope="col" className="px-4 py-3 font-medium h-12 align-middle text-muted-foreground">Payment</th>
                                <th scope="col" className="px-4 py-3 font-medium h-12 align-middle text-muted-foreground text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading && orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                            {order.orderCode}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">
                                            {order.totalAmount.toLocaleString()} ₫
                                        </td>
                                        <td className="px-4 py-3 font-medium text-red-500">
                                            -{order.discountAmount.toLocaleString()} ₫
                                        </td>
                                        <td className="px-4 py-3">
                                            {statusBadge(order.status)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            <div className="font-semibold">{order.paymentMethod}</div>
                                            <div className="text-xs mt-1 font-medium">
                                                {order.paymentStatus === "PAID" ? (
                                                    <span className="text-green-600 dark:text-green-400">Paid ✅</span>
                                                ) : (
                                                    <span className="text-amber-600 dark:text-amber-400">Unpaid ⏳</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm font-semibold transition"
                                            >
                                                Details & Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdateSuccess={() => {
                        setSelectedOrder(null);
                        fetchOrders();
                    }}
                />
            )}
        </div>
    );
}
