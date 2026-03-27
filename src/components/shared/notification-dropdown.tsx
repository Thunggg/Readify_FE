"use client";

import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/contexts/user-context";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export function NotificationDropdown() {
  const { currentUser } = useCurrentUser();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(currentUser?._id);

  if (!currentUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center p-0 border-2 border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 overflow-hidden shadow-2xl animate-in fade-in transition-all duration-300">
        <DropdownMenuLabel className="p-4 flex items-center justify-between border-b bg-muted/50">
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold">Thông báo</span>
            <span className="text-xs text-muted-foreground font-normal">
              {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : "Bạn đã đọc hết thông báo"}
            </span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </DropdownMenuLabel>
        <ScrollArea className="h-[400px]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Đang tải thông báo...</p>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground opacity-60">
              <Bell className="h-12 w-12" />
              <p className="text-sm font-medium">Bạn chưa có thông báo nào</p>
            </div>
          )}

          <div className="flex flex-col">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={cn(
                  "relative flex flex-col gap-1 p-4 border-b border-muted last:border-0 hover:bg-muted/30 transition-all cursor-pointer group",
                  !n.isRead && "bg-primary/5 border-l-4 border-l-primary"
                )}
                onClick={() => !n.isRead && markAsRead(n._id)}
              >
                {!n.isRead && (
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-semibold leading-tight", !n.isRead && "text-primary")}>
                    {n.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {n.content}
                </p>
                <div className="mt-1 flex items-center gap-2">
                   <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded">
                    {n.type || "SYSTEM"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {dayjs(n.createdAt).fromNow()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2 bg-muted/20">
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary transition-colors h-8">
            Xem tất cả thông báo
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
