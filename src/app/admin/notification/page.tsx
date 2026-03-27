"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotificationApiRequest } from "@/api-request/notification";
import { AccountApiRequest } from "@/api-request/account";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  UserSearch,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AdminAccount } from "@/types/account";
import { Separator } from "@/components/ui/separator";

const NOTIFICATION_TYPES = [
  { value: "SYSTEM", label: "Hệ thống" },
  { value: "ORDER", label: "Đơn hàng" },
  { value: "PROMOTION", label: "Khuyến mãi" },
  { value: "ACCOUNT", label: "Tài khoản" },
  { value: "REVIEW", label: "Đánh giá" },
  { value: "OTHER", label: "Khác" },
] as const;

export default function AdminNotificationPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchUserId, setSearchUserId] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    userId: "",
    title: "",
    content: "",
    type: "SYSTEM",
  });
  const [recipientPreview, setRecipientPreview] = useState<AdminAccount | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailNotification, setDetailNotification] = useState<any>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, unknown> = {
        page,
        limit: 10,
        ...(searchUserId.trim() ? { userId: searchUserId.trim() } : {}),
        ...(typeFilter !== "all" ? { type: typeFilter } : {}),
      };
      const res = await NotificationApiRequest.getAdminNotifications(params);
      if (res?.payload?.success) {
        setNotifications(res.payload.data.items);
        setTotal(res.payload.data.total);
      }
    } catch {
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setIsLoading(false);
    }
  }, [page, searchUserId, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setPage(1);
  }, [searchUserId, typeFilter]);

  const resetCreateForm = () => {
    setNewNotification({ userId: "", title: "", content: "", type: "SYSTEM" });
    setRecipientPreview(null);
  };

  const handleLookupRecipient = async () => {
    const id = newNotification.userId.trim();
    if (!id) {
      toast.warning("Nhập ID người dùng");
      return;
    }
    setLookupLoading(true);
    setRecipientPreview(null);
    try {
      const res = await AccountApiRequest.getAccountById(id);
      if (res?.payload?.success && res.payload.data) {
        setRecipientPreview(res.payload.data as AdminAccount);
        toast.success("Đã tìm thấy người dùng");
      } else {
        toast.error("Không tìm thấy người dùng");
      }
    } catch (err: any) {
      const msg = err?.payload?.message || "Không tìm thấy người dùng hoặc không có quyền";
      toast.error(msg);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCreate = async () => {
    const uid = newNotification.userId.trim();
    if (!uid || !newNotification.title.trim() || !newNotification.content.trim()) {
      toast.warning("Vui lòng điền đầy đủ thông tin và tra cứu người nhận");
      return;
    }
    if (!recipientPreview || (recipientPreview._id !== uid && recipientPreview.id !== uid)) {
      toast.warning("Vui lòng bấm «Tra cứu người nhận» để xác nhận ID hợp lệ");
      return;
    }

    setSendLoading(true);
    try {
      const res = await NotificationApiRequest.sendAdminNotification({
        recipientUserId: uid,
        title: newNotification.title.trim(),
        content: newNotification.content.trim(),
        type: newNotification.type,
      });
      if (res?.payload?.success) {
        toast.success("Đã gửi thông báo");
        setIsCreateDialogOpen(false);
        resetCreateForm();
        fetchNotifications();
      }
    } catch (err: any) {
      const msg = err?.payload?.message || "Gửi thông báo thất bại";
      toast.error(msg);
    } finally {
      setSendLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
    try {
      await NotificationApiRequest.deleteNotification(id);
      toast.success("Xóa thông báo thành công");
      fetchNotifications();
    } catch {
      toast.error("Xóa thông báo thất bại");
    }
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailNotification(null);
    try {
      const res = await NotificationApiRequest.getAdminNotificationDetail(id);
      if (res?.payload?.success) {
        setDetailNotification(res.payload.data);
      }
    } catch {
      toast.error("Không tải được chi tiết thông báo");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const recipientFromDetail = detailNotification?.createdBy;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Thông báo</h1>
          <p className="text-muted-foreground">
            Xem và gửi thông báo hệ thống đến người dùng (theo ID)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications}>
            <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetCreateForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Tạo thông báo mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo thông báo mới</DialogTitle>
                <DialogDescription>
                  Nhập ID người nhận, tra cứu để xem thông tin, rồi gửi thông báo.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">ID người nhận</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="MongoDB ObjectId (vd: 65f...)"
                      value={newNotification.userId}
                      onChange={(e) => {
                        setNewNotification({ ...newNotification, userId: e.target.value });
                        setRecipientPreview(null);
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void handleLookupRecipient()}
                      disabled={lookupLoading}
                    >
                      {lookupLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserSearch className="mr-2 h-4 w-4" />
                          Tra cứu
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {recipientPreview && (
                  <Card className="border-primary/30 bg-muted/40">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm">Người nhận</CardTitle>
                      <CardDescription className="text-xs">
                        Xác nhận trước khi gửi
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 pt-0 text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Họ tên: </span>
                        <span className="font-medium">
                          {recipientPreview.firstName} {recipientPreview.lastName}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Email: </span>
                        {recipientPreview.email}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        _id: {recipientPreview._id ?? recipientPreview.id}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <Input
                    placeholder="Tiêu đề thông báo"
                    value={newNotification.title}
                    onChange={(e) =>
                      setNewNotification({ ...newNotification, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Loại</label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(val) => setNewNotification({ ...newNotification, type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Nội dung</label>
                  <Textarea
                    placeholder="Nhập nội dung thông báo..."
                    rows={4}
                    value={newNotification.content}
                    onChange={(e) =>
                      setNewNotification({ ...newNotification, content: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => void handleCreate()} disabled={sendLoading}>
                  {sendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi thông báo"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Lọc theo ID người nhận..."
                className="pl-9"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại thông báo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả các loại</SelectItem>
                {NOTIFICATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Loại</TableHead>
                <TableHead>Người nhận</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ))
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Không tìm thấy thông báo nào
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((n) => (
                  <TableRow key={n._id} className="hover:bg-muted/30">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          n.type === "SYSTEM" &&
                            "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200",
                          n.type === "ORDER" &&
                            "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200",
                          n.type === "PROMOTION" &&
                            "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200",
                          n.type === "REVIEW" &&
                            "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border-violet-200",
                        )}
                      >
                        {n.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {n.createdBy?.firstName} {n.createdBy?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">{n.createdBy?.email}</span>
                        {n.createdBy?._id && (
                          <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            {String(n.createdBy._id)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 max-w-xs">
                        <span className="font-semibold text-sm line-clamp-1">{n.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{n.content}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={n.isRead ? "secondary" : "default"}
                        className={cn(
                          "rounded-full px-2 py-0",
                          !n.isRead && "bg-green-600 hover:bg-green-700",
                        )}
                      >
                        {n.isRead ? "Đã đọc" : "Chưa đọc"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {dayjs(n.createdAt).format("DD/MM/YYYY HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => void openDetail(n._id)}
                          >
                            Chi tiết thông báo & người nhận
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600"
                            onClick={() => void handleDelete(n._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t flex justify-between items-center text-sm text-muted-foreground">
          <p>
            Hiển thị {notifications.length} / {total} thông báo
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * 10 >= total}
              onClick={() => setPage(page + 1)}
            >
              Tiếp theo
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết thông báo</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 flex justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : detailNotification ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Tiêu đề</p>
                <p className="font-semibold">{detailNotification.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Nội dung</p>
                <p className="whitespace-pre-wrap">{detailNotification.content}</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-muted-foreground text-xs">Loại:</span>
                <Badge variant="outline">{detailNotification.type}</Badge>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-2">Người nhận</p>
                {recipientFromDetail ? (
                  <div className="rounded-md border bg-muted/30 p-3 space-y-1">
                    <p>
                      {recipientFromDetail.firstName} {recipientFromDetail.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs">{recipientFromDetail.email}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {String(recipientFromDetail._id ?? "")}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Không có dữ liệu</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Tạo lúc: {dayjs(detailNotification.createdAt).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
