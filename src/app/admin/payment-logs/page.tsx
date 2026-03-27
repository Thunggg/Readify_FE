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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  DollarSign,
  RefreshCw,
  Eye,
  Calendar,
  CreditCard,
  User,
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
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page,
        limit: 10,
        ...(orderCode ? { orderCode } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      };
      
      // We'll use the newly created BE endpoint
      const res = await http.get<any>("/payment-logs/admin/all", { params });
      if (res?.payload?.success) {
        setLogs(res.payload.data.items);
        setTotal(res.payload.data.total);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách log thanh toán");
    } finally {
      setIsLoading(false);
    }
  }, [page, orderCode, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
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
              Theo dõi và tra cứu lịch sử giao dịch toàn hệ thống
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading} className="rounded-xl border-muted-foreground/20 hover:bg-muted font-medium px-4">
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Làm mới
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md ring-1 ring-border/50">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-60" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng (VD: ORD...)"
                className="pl-9 h-11 bg-background/50 border-muted-foreground/20 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all rounded-xl"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] h-11 bg-background/50 border-muted-foreground/20 rounded-xl font-medium">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING" className="rounded-lg">Đang chờ</SelectItem>
                <SelectItem value="PAID" className="rounded-lg">Thành công</SelectItem>
                <SelectItem value="FAILED" className="rounded-lg">Thất bại</SelectItem>
                <SelectItem value="CANCELLED" className="rounded-lg">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/40">
                <TableHead className="py-4 pl-6 font-bold uppercase text-[10px] tracking-widest opacity-60">Giao dịch</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60">Khách hàng</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60">Số tiền</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60">Phương thức</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60 text-center">Trạng thái</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest opacity-60 text-right pr-6">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-16 text-center text-muted-foreground animate-pulse">
                      Đang truy xuất dữ liệu...
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={6} className="h-48 text-center text-muted-foreground opacity-50">
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
                        <span className="text-[10px] text-muted-foreground font-mono opacity-60 uppercase">{log._id.slice(-8)}</span>
                      </div>
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
                        log.status === 'PENDING' && "bg-sky-500 hover:bg-sky-600 border-none text-white"
                      )}>
                        {log.status === 'PAID' ? 'Thành công' : log.status === 'FAILED' ? 'Thất bại' : 'Đang chờ'}
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
