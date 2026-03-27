import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { NotificationApiRequest } from "@/api-request/notification";
import { toast } from "sonner";

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await NotificationApiRequest.getNotifications({ limit: 10 });
      if (res?.payload?.success) {
        setNotifications(res.payload.data.items);
        const unread = res.payload.data.items.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    let socket: Socket | null = null;

    const connectSocket = async () => {
      try {
        const res = await fetch("/api/auth/token");
        const data = await res.json();
        const token = data.success ? data.token : null;
        
        if (!token) return;

        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000/notifications", {
          auth: { token },
          transports: ["websocket"],
        });

        socket.on("newNotification", (notification: any) => {
          setNotifications((prev) => [notification, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);
          toast.info(notification.title, {
            description: notification.content,
          });
        });
      } catch (err) {
        console.error("Socket connection failed:", err);
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const res = await NotificationApiRequest.updateReadStatus(id, true);
      if (res?.payload?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await NotificationApiRequest.markAllAsRead();
      if (res?.payload?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
