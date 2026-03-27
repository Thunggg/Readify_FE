"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  DollarSign,
  RefreshCw,
  CreditCard,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import http from "@/lib/http";
import { cn } from "@/lib/utils";

export default function AdminPaymentLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [orderCode, setOrderCode] = useState("");
  /** Payment log row status (PENDING / PAID / …) */
  const [statusFilter, setStatusFilter] = useState("all");
  /** Linked order status — default CONFIRMED per product requirement */
  const [orderStatusFilter, setOrderStatusFilter] = useState("CONFIRMED");

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page,
        limit: 10,
        ...(orderCode ? { orderCode } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(orderStatusFilter !== "all" ? { orderStatus: orderStatusFilter } : {}),
      };
      
      // We'll use the newly created BE endpoint
      const res = await http.get<any>("/payment-logs/admin/all", { params });
      if (res?.payload?.success && res.payload.data) {
        // PaginatedResponse: { items, meta: { total, page, ... } }
        setLogs(res.payload.data.items ?? []);
        setTotal(res.payload.data.meta?.total ?? 0);
      } else {
        setLogs([]);
        setTotal(0);
      }
    } catch (error: any) {
      const msg =
        error?.payload?.message ||
        error?.message ||
        "Không thể tải danh sách log thanh toán";
      toast.error(typeof msg === "string" ? msg : "Không thể tải danh sách log thanh toán");
    } finally {
      setIsLoading(false);
    }
  }, [page, orderCode, statusFilter, orderStatusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const orderStatusLabel = (s?: string) => {
    switch (s) {
      case "PENDING":
        return "Chờ xử lý";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "DELIVERED":
        return "Đang giao";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return s ?? "—";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Log Thanh Toán</h1>
            <p className="text-muted-foreground">
              Mặc định chỉ hiển thị giao dịch của đơn hàng{" "}
              <span className="text-foreground font-medium">đã xác nhận (Confirmed)</span>
              — đổi &quot;Trạng thái đơn&quot; nếu cần xem toàn bộ.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading} className="rounded-xl border-muted-foreground/20 hover:bg-muted font-medium px-4">
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Làm mới
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md ring-1 ring-border/50">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-60" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng (VD: ORD...)"
                className="pl-9 h-11 bg-background/50 border-muted-foreground/20 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-xl"
                value={orderCode}
                onChange={(e) => {
                  setPage(1);
                  setOrderCode(e.target.value);
                }}
              />
            </div>
            <Select
              value={orderStatusFilter}
              onValueChange={(v) => {
                setPage(1);
                setOrderStatusFilter(v);
              }}
            >
              <SelectTrigger className="w-full sm:w-[220px] h-11 bg-background/50 border-muted-foreground/20 rounded-xl font-medium">
                <SelectValue placeholder="Trạng thái đơn" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="CONFIRMED" className="rounded-lg">
                  Đơn: Đã xác nhận
                </SelectItem>
                <SelectItem value="all" className="rounded-lg">
                  Đơn: Tất cả
                </SelectItem>
                <SelectItem value="PENDING" className="rounded-lg">
                  Đơn: Chờ xử lý
                </SelectItem>
                <SelectItem value="DELIVERED" className="rounded-lg">
                  Đơn: Đang giao
                </SelectItem>
                <SelectItem value="COMPLETED" className="rounded-lg">
                  Đơn: Hoàn thành
                </SelectItem>
                <SelectItem value="CANCELLED" className="rounded-lg">
                  Đơn: Đã hủy
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setPage(1);
                setStatusFilter(v);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px] h-11 bg-background/50 border-muted-foreground/20 rounded-xl font-medium">
                <SelectValue placeholder="TT thanh toán (log)" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">Thanh toán: Tất cả</SelectItem>
                <SelectItem value="PENDING" className="rounded-lg">Thanh toán: Đang chờ</SelectItem>
                <SelectItem value="PAID" className="rounded-lg">Thanh toán: Thành công</SelectItem>
                <SelectItem value="FAILED" className="rounded-lg">Thanh toán: Thất bại</SelectItem>
                <SelectItem value="CANCELLED" className="rounded-lg">Thanh toán: Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/40">
                <TableHead className="py-4 pl-6 font-bold uppercase text-[10px] tracking-widest opacity-60">Giao dịch</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60">Trạng thái đơn</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60">Khách hàng</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60">Số tiền</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60">Phương thức</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60 text-center">TT thanh toán</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60 text-right pr-6">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="h-16 text-center text-muted-foreground animate-pulse">
                      Đang truy xuất dữ liệu...
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={7} className="h-48 text-center text-muted-foreground opacity-50">
                    <div className="flex flex-col items-center gap-3">
                      <Hash className="h-10 w-10 opacity-20" />
                      <p className="font-medium">Không tìm thấy giao dịch nào phù hợp</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id} className="hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-colors border-b border-border/20 group">
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{log.order?.orderCode}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono opacity-60 uppercase">
                          {String(log._id).slice(-8)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full text-[10px] font-bold uppercase",
                          log.order?.status === "CONFIRMED" &&
                            "border-sky-500/50 text-sky-600 dark:text-sky-400",
                          log.order?.status === "COMPLETED" &&
                            "border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
                          log.order?.status === "PENDING" &&
                            "border-amber-500/50 text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {orderStatusLabel(log.order?.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold">{log.user?.firstName} {log.user?.lastName}</span>
                          <span className="text-xs text-muted-foreground/70">{log.user?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(log.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span className="text-xs font-medium text-muted-foreground">{log.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={log.status === 'PAID' ? "default" : "secondary"} className={cn(
                        "rounded-full px-3 py-0 text-[10px] font-bold uppercase tracking-wide",
                        log.status === 'PAID' && "bg-emerald-500 hover:bg-emerald-600 border-none",
                        log.status === 'FAILED' && "bg-red-500 hover:bg-red-600 border-none text-white",
                        log.status === 'PENDING' && "bg-sky-500 hover:bg-sky-600 border-none text-white",
                        log.status === 'CANCELLED' && "bg-zinc-500 hover:bg-zinc-600 border-none text-white"
                      )}>
                        {log.status === 'PAID'
                          ? 'Thành công'
                          : log.status === 'FAILED'
                            ? 'Thất bại'
                            : log.status === 'CANCELLED'
                              ? 'Đã hủy'
                              : 'Đang chờ'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex flex-col items-end opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium">{dayjs(log.createdAt).format("HH:mm:ss")}</span>
                        <span className="text-xs text-muted-foreground">{dayjs(log.createdAt).format("DD/MM/YYYY")}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t border-border/40 flex justify-between items-center text-sm text-muted-foreground bg-muted/10">
          <p>Hiển thị <span className="text-foreground font-bold">{logs.length}</span> giao dịch trong tổng số <span className="text-foreground font-bold">{total}</span></p>
          <div className="flex gap-2">
            <Button 
                variant="ghost" 
                size="sm" 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
                className="rounded-lg h-9"
            >Trước</Button>
            <div className="flex items-center px-4 font-bold text-foreground">Trang {page}</div>
             <Button 
                variant="ghost" 
                size="sm" 
                disabled={page * 10 >= total}
                onClick={() => setPage(page + 1)}
                 className="rounded-lg h-9"
            >Tiếp theo</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
