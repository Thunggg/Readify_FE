"use client";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  CalendarIcon,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { cn } from "@/lib/utils";
import { IncomeApiRequest } from "@/api-request/income";
import type {
  OverviewStats,
  IncomePeriodData,
  CategoryStat,
  TopSellingBook,
  RecentOrder,
  GroupBy,
} from "@/types/income";
import { toast } from "sonner";

export default function IncomeDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [statistics, setStatistics] = useState<IncomePeriodData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [topBooks, setTopBooks] = useState<TopSellingBook[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filter states
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [startDate, setStartDate] = useState<Date | undefined>(
    dayjs().subtract(5, "month").toDate()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        groupBy,
      };

      console.log("Fetching income data with params:", params);

      const [overviewRes, statsRes, categoryRes, topBooksRes, recentRes] =
        await Promise.all([
          IncomeApiRequest.getOverview(),
          IncomeApiRequest.getStatistics(params),
          IncomeApiRequest.getCategoryStatistics(params),
          IncomeApiRequest.getTopSellingBooks({
            startDate: params.startDate,
            endDate: params.endDate,
            limit: 10
          }),
          IncomeApiRequest.getRecentOrders({ limit: 5 }),
        ]);

      console.log("API Responses:", {
        overview: overviewRes,
        stats: statsRes,
        category: categoryRes,
        topBooks: topBooksRes,
        recent: recentRes,
      });

      if (overviewRes?.payload?.success) {
        console.log("Setting overview:", overviewRes.payload.data);
        setOverview(overviewRes.payload.data);
      } else {
        console.warn("Overview response not successful:", overviewRes);
      }

      if (statsRes?.payload?.success) {
        console.log("Setting statistics:", statsRes.payload.data.statistics);
        setStatistics(statsRes.payload.data.statistics || []);
      } else {
        console.warn("Statistics response not successful:", statsRes);
      }

      if (categoryRes?.payload?.success) {
        console.log("Setting category stats:", categoryRes.payload.data.categories);
        setCategoryStats(categoryRes.payload.data.categories || []);
      } else {
        console.warn("Category response not successful:", categoryRes);
      }

      if (topBooksRes?.payload?.success) {
        console.log("Setting top books:", topBooksRes.payload.data.books);
        setTopBooks(topBooksRes.payload.data.books || []);
      } else {
        console.warn("Top books response not successful:", topBooksRes);
      }

      if (recentRes?.payload?.success) {
        console.log("Setting recent orders:", recentRes.payload.data.orders);
        setRecentOrders(recentRes.payload.data.orders || []);
      } else {
        console.warn("Recent orders response not successful:", recentRes);
      }
    } catch (error: any) {
      console.error("Failed to fetch income data:", error);
      console.error("Error details:", {
        message: error?.message,
        payload: error?.payload,
        status: error?.status,
        response: error?.response,
      });

      const errorMessage = error?.payload?.message || error?.message || "Không thể tải dữ liệu thống kê";
      toast.error(errorMessage);

      // Log thêm thông tin chi tiết
      if (error?.status === 401) {
        toast.error("Vui lòng đăng nhập lại");
      } else if (error?.status === 403) {
        toast.error("Bạn không có quyền truy cập chức năng này");
      }
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, groupBy]);

  const fetchAiSummary = async () => {
    setIsAiLoading(true);
    try {
      const params = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };
      const res = await IncomeApiRequest.getAiSummary(params);
      if (res?.payload?.success) {
        setAiSummary(res.payload.data.summary);
      }
    } catch (error: any) {
      toast.error("Không thể lấy phân tích AI");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ChangeIndicator = ({
    value,
    suffix = "%",
  }: {
    value: number;
    suffix?: string;
  }) => {
    const isPositive = value >= 0;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium",
          isPositive ? "text-green-600" : "text-red-600"
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isPositive ? "+" : ""}
        {value}
        {suffix}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Thống kê doanh thu
          </h1>
          <p className="text-muted-foreground">
            Tổng quan hiệu suất kinh doanh và phân tích
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? dayjs(startDate).format("DD/MM/YY") : "Từ ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">-</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? dayjs(endDate).format("DD/MM/YY") : "Đến ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Group By */}
          <Select
            value={groupBy}
            onValueChange={(value: GroupBy) => setGroupBy(value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo ngày</SelectItem>
              <SelectItem value="week">Theo tuần</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
              <SelectItem value="year">Theo năm</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          <Button
            variant="default"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold"
            onClick={fetchAiSummary}
            disabled={isAiLoading || isLoading}
          >
            <Sparkles className={cn("mr-2 h-4 w-4", isAiLoading && "animate-pulse")} />
            Phân tích AI
          </Button>
        </div>
      </div>

      {/* AI Summary Section */}
      {aiSummary && (
        <Card className="border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-900/10 overflow-hidden relative shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none">
            <Sparkles className="h-28 w-28 text-purple-600 dark:text-purple-400" />
          </div>
          <CardHeader className="pb-3 border-b border-purple-100 dark:border-purple-800/30">
            <CardTitle className="text-purple-800 dark:text-purple-300 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Thông tin chi tiết từ AI
            </CardTitle>
            <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
              Dựa trên dữ liệu doanh thu và xu hướng bán hàng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose max-w-none text-foreground text-sm leading-relaxed space-y-4">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-xl md:text-2xl font-bold mt-6 mb-4 text-purple-900 dark:text-purple-200" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg md:text-xl font-bold mt-5 mb-3 text-purple-800 dark:text-purple-300 border-b border-purple-100 dark:border-purple-800/30 pb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base md:text-lg font-semibold mt-4 mb-2 text-purple-700 dark:text-purple-400" {...props} />,
                  h4: ({ node, ...props }) => <h4 className="text-sm md:text-base font-medium mt-4 mb-2 text-foreground" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-4 text-muted-foreground leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-outside pl-5 mb-4 space-y-2 text-muted-foreground marker:text-purple-500" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-outside pl-5 mb-4 space-y-2 text-muted-foreground marker:text-purple-500" {...props} />,
                  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-foreground dark:text-purple-100" {...props} />,
                  code: (props: any) => {
                    const { node, inline, ...rest } = props;
                    return inline ? (
                      <code className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded-md text-xs font-mono" {...rest} />
                    ) : (
                      <pre className="bg-purple-50 dark:bg-purple-900/20 text-foreground p-4 rounded-lg overflow-x-auto text-sm my-4 border border-purple-100 dark:border-purple-800/30"><code {...rest} /></pre>
                    );
                  },
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-400 dark:border-purple-600 pl-4 py-2 my-4 italic text-muted-foreground bg-purple-50/50 dark:bg-purple-900/10 rounded-r-lg" {...props} />
                }}
              >
                {aiSummary}
              </ReactMarkdown>
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                onClick={() => setAiSummary(null)}
              >
                Đóng phân tích
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu tháng này
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview?.currentMonth.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <ChangeIndicator value={overview?.changes.revenue || 0} /> so với
              tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đơn hàng tháng này
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.currentMonth.orders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <ChangeIndicator value={overview?.changes.orders || 0} /> so với
              tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview?.allTime.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng {overview?.allTime.orders || 0} đơn hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sách đã bán (tháng)
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.currentMonth.books || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng cộng {overview?.allTime.books || 0} sách
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4" suppressHydrationWarning>
        <TabsList>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu & Lợi nhuận</CardTitle>
              <CardDescription>
                Xu hướng doanh thu và lợi nhuận theo thời gian
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={statistics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={formatShortCurrency} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
                    <Bar dataKey="profit" fill="#10b981" name="Lợi nhuận" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  {isLoading ? "Đang tải..." : "Không có dữ liệu"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng đơn hàng</CardTitle>
              <CardDescription>
                Số lượng đơn hàng theo thời gian
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={statistics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Đơn hàng"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  {isLoading ? "Đang tải..." : "Không có dữ liệu"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo danh mục</CardTitle>
                <CardDescription>
                  Phân bổ doanh thu theo danh mục sách
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryStats as any}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, payload }) =>
                          `${name}: ${payload?.percentage || 0}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="totalSales"
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    {isLoading ? "Đang tải..." : "Không có dữ liệu"}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng gần đây</CardTitle>
                <CardDescription>5 giao dịch mới nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {order.customer || "Khách hàng"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.orderCode} &bull; {order.books} sản phẩm
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(order.amount)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      {isLoading ? "Đang tải..." : "Chưa có đơn hàng"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Top Selling Books */}
      <Card>
        <CardHeader>
          <CardTitle>Sách bán chạy nhất</CardTitle>
          <CardDescription>
            Top 10 sách có doanh số cao nhất trong khoảng thời gian đã chọn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topBooks.length > 0 ? (
              topBooks.map((book, index) => (
                <div
                  key={book.bookId}
                  className="flex items-center gap-4 border-b pb-3 last:border-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    #{index + 1}
                  </div>
                  {book.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={book.thumbnailUrl}
                      alt={book.title}
                      className="h-12 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-10 bg-muted rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Đã bán: {book.totalQuantity} cuốn
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    {formatCurrency(book.totalRevenue)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {isLoading ? "Đang tải..." : "Không có dữ liệu"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
