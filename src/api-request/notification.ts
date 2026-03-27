import http from "@/lib/http";

export const NotificationApiRequest = {
  getNotifications: (params: { type?: string; isRead?: boolean; page?: number; limit?: number }) =>
    http.get<any>("/notifications", { params }),

  getNotificationDetail: (id: string) =>
    http.get<any>(`/notifications/${id}`),

  markAllAsRead: () =>
    http.patch<any>("/notifications/mark-all-read", {}),

  updateReadStatus: (id: string, isRead: boolean) =>
    http.patch<any>(`/notifications/${id}`, { isRead }),

  deleteNotification: (id: string) =>
    http.delete<any>(`/notifications/${id}`),

  getAdminNotifications: (params: { userId?: string; type?: string; isRead?: boolean; page?: number; limit?: number }) =>
    http.get<any>("/notifications/admin/all", { params }),

  sendAdminNotification: (body: {
    recipientUserId: string;
    title: string;
    content: string;
    type?: string;
  }) =>
    http.post<any>("/notifications/admin/send", body, { credentials: "include", cache: "no-store" }),

  getAdminNotificationDetail: (id: string) =>
    http.get<any>(`/notifications/admin/${id}`, { credentials: "include", cache: "no-store" }),
};
