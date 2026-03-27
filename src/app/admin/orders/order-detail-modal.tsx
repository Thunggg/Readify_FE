/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { XIcon } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { OrderApiRequest } from "@/api-request/order-request";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

export default function OrderDetailModal({
  order,
  onClose,
  onUpdateSuccess,
}: OrderDetailModalProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await OrderApiRequest.updateOrder(order._id, { status });

      if (response?.payload?.success || response?.status === 200) {
        alert("Order status updated successfully!");
        onUpdateSuccess();
      } else {
        setError(
          response?.payload?.message ||
            "Failed to update order. Please try again.",
        );
      }
    } catch (err: any) {
      setError(
        `Cannot change status from ${order.status} to ${status}. Please follow the correct order flow.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Order Details: {order.orderCode}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg p-1.5 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-5 space-y-6 overflow-y-auto">
          {error && (
            <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          {/* Customer Info Box */}
          <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Customer Info:
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-200">
                {typeof order.userId === "object"
                  ? (order.userId as any).email || (order.userId as any)._id
                  : order.userId}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Order Date:
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-200">
                {new Date(order.createdAt).toLocaleString("en-US")}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Shipping Address:
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-200">
                {order.shippingAddress}
              </p>
            </div>
            {order.note && (
              <div className="col-span-2">
                <p className="text-gray-500 dark:text-gray-400 mb-1">Note:</p>
                <p className="font-medium text-amber-600 dark:text-amber-500 italic bg-amber-50 dark:bg-amber-900/10 p-2 rounded">
                  {order.note}
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white mb-3">
              Order Items ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white dark:bg-gray-900 border dark:border-gray-800 p-3 rounded-lg shadow-sm"
                >
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 dark:text-gray-200 mb-1">
                      Book:{" "}
                      {typeof item.bookId === "object"
                        ? (item.bookId as any).title ||
                          (item.bookId as any).name ||
                          (item.bookId as any)._id
                        : item.bookId}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {item.unitPrice.toLocaleString()} ₫ x{" "}
                      <span className="font-bold text-black dark:text-white">
                        {item.quantity}
                      </span>
                    </p>
                  </div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {item.subtotal.toLocaleString()} ₫
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="flex flex-col items-end space-y-2 text-sm dark:text-gray-300 border-t dark:border-gray-800 pt-4">
            <div className="flex justify-between w-48">
              <span>Subtotal:</span>
              <span className="font-semibold">
                {order.totalAmount.toLocaleString()} ₫
              </span>
            </div>
            <div className="flex justify-between w-48 text-red-500">
              <span>Discount:</span>
              <span className="font-semibold">
                -{order.discountAmount.toLocaleString()} ₫
              </span>
            </div>
            <div className="flex justify-between w-full sm:w-64 border-t dark:border-gray-800 pt-2 mt-2 text-lg">
              <span className="font-bold text-gray-900 dark:text-white">
                Total:
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {order.finalAmount.toLocaleString()} ₫
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col sm:flex-row gap-3 items-center justify-between rounded-b-lg">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Update Status:
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2 px-3 w-full sm:w-auto dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DELIVERED">Delivered</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading || status === order.status}
              className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
