"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PromotionApiRequest } from "@/api-request/promotion";
import { PromotionLog, PromotionLogAction } from "@/types/promotion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import { format } from "date-fns";

export default function PromotionLogsTable() {
  // State for logs
  const [logs, setLogs] = useState<PromotionLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Sort state
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Selected log for detail view
  const [selectedLog, setSelectedLog] = useState<PromotionLog | null>(null);

  const fetchLogs = useCallback(
    async (currentPage: number = 1) => {
      try {
        setLoading(true);
        setError("");

        const queryParams: any = {
          page: currentPage,
          limit: limit,
          sortBy: "CREATED_AT",
          order: sortOrder,
        };

        const response =
          await PromotionApiRequest.getPromotionLogs(queryParams);

        // Handle response structure
        if (response?.payload?.success) {
          const data = response.payload.data;
          const logsArray = Array.isArray(data) ? data : data?.items || [];
          const paginationMeta = (data as any)?.meta || {
            total: logsArray.length,
            totalPages: 1,
          };

          setLogs(logsArray);
          setTotal(paginationMeta.total || 0);
        } else {
          const errorMsg =
            response?.payload?.message || "Failed to load promotion logs";
          setError(errorMsg);
        }
      } catch (err: any) {
        setError("Cannot connect to server: " + err.message);
      } finally {
        setLoading(false);
      }
    },
    [sortOrder, limit],
  );

  // Refetch when sort order changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchLogs(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [sortOrder, fetchLogs]);

  // Fetch on page change
  useEffect(() => {
    fetchLogs(page);
  }, [page, fetchLogs]);

  const actionBadge = (action: string | PromotionLogAction) => {
    const config: Record<string, { label: string; className: string }> = {
      CREATED: {
        label: "Created",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      },
      UPDATED: {
        label: "Updated",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
      DELETED: {
        label: "Deleted",
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      },
      APPLIED: {
        label: "Applied",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      },
      APPLY: {
        label: "Applied",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      },
    };

    const ac = config[action] || {
      label: action,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ac.className}`}
      >
        {ac.label}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Toolbar (Sort Only) */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-950 p-4 rounded-md border border-gray-200 dark:border-gray-800">
        <ArrowUpDownIcon className="h-4 w-4 text-gray-500" />
        <label className="text-sm text-gray-600 dark:text-gray-400">
          Sort by Created Date:
        </label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="text-sm border border-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="inline-flex items-center gap-2">
            <div className="h-4 w-4 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="h-4 w-4 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="h-4 w-4 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No promotion logs found
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Promotion Code
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Performed By
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-gray-900 dark:text-gray-100">
                      {log.promotionCode || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {log.promotionName || "N/A"}
                    </td>
                    <td className="px-4 py-3">{actionBadge(log.action)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      <div>
                        <div className="font-medium">
                          {log.performedBy?.firstName &&
                          log.performedBy?.lastName
                            ? `${log.performedBy.firstName} ${log.performedBy.lastName}`
                            : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {log.performedBy?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="View details"
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-950 p-4 rounded-md border border-gray-200 dark:border-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} logs
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrentPage = pageNum === page;
                  const isNearCurrent = Math.abs(pageNum - page) <= 1;

                  if (
                    !isNearCurrent &&
                    pageNum !== 1 &&
                    pageNum !== totalPages
                  ) {
                    return null;
                  }

                  if (pageNum === 2 && page > 3) {
                    return (
                      <span key="ellipsis" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }

                  if (pageNum === totalPages - 1 && page < totalPages - 2) {
                    return (
                      <span key="ellipsis2" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        isCurrentPage
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-5 border-b dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Promotion Log Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
              {/* Promotion Info */}
              {selectedLog.promotionId && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Promotion Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Code:
                      </span>
                      <p className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {selectedLog.promotionCode || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Name:
                      </span>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedLog.promotionName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Log Details */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Log Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Action:
                    </span>
                    <p className="mt-1">{actionBadge(selectedLog.action)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Date:
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {format(
                        new Date(selectedLog.createdAt),
                        "dd/MM/yyyy HH:mm:ss",
                      )}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Performed By:
                    </span>
                    <div className="mt-1 bg-white dark:bg-gray-900 p-2 rounded text-sm">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedLog.performedBy?.firstName &&
                        selectedLog.performedBy?.lastName
                          ? `${selectedLog.performedBy.firstName} ${selectedLog.performedBy.lastName}`
                          : "N/A"}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {selectedLog.performedBy?.email || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Data */}
              {selectedLog.newData && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Additional Information
                  </h4>
                  <pre className="bg-white dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto text-gray-900 dark:text-gray-100">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Note */}
              {selectedLog.note && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Note
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {selectedLog.note}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t dark:border-gray-800 p-4 md:p-5 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
