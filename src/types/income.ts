// ===== ENUMS =====
export type GroupBy = "day" | "week" | "month" | "year";

// ===== REQUEST PARAMS =====
export interface IncomeStatisticsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: GroupBy;
}

export interface TopSellingParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface RecentOrdersParams {
  limit?: number;
}

export interface ExportIncomeParams {
  startDate?: string;
  endDate?: string;
  groupBy?: GroupBy;
}

// ===== RESPONSE DATA =====
export interface OverviewStats {
  currentMonth: {
    revenue: number;
    orders: number;
    books: number;
  };
  allTime: {
    revenue: number;
    orders: number;
    books: number;
  };
  changes: {
    revenue: number;
    orders: number;
  };
}

export interface IncomePeriodData {
  period: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface IncomeStatistics {
  statistics: IncomePeriodData[];
  dateRange: {
    start: string;
    end: string;
  };
  groupBy: GroupBy;
}

export interface CategoryStat {
  categoryId: string | null;
  name: string;
  totalSales: number;
  totalQuantity: number;
  percentage: number;
  color: string;
}

export interface CategoryStatistics {
  categories: CategoryStat[];
  total: number;
}

export interface TopSellingBook {
  bookId: string;
  title: string;
  thumbnailUrl?: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface TopSellingBooks {
  books: TopSellingBook[];
}

export interface RecentOrder {
  _id: string;
  orderCode: string;
  customer: string;
  amount: number;
  books: number;
  createdAt: string;
}

export interface RecentOrders {
  orders: RecentOrder[];
}

export interface ExportDataItem {
  period: string;
  revenue: number;
  totalAmount: number;
  discountAmount: number;
  orders: number;
  booksSold: number;
}

export interface ExportIncome {
  data: ExportDataItem[];
  totals: {
    revenue: number;
    totalAmount: number;
    discountAmount: number;
    orders: number;
    booksSold: number;
  };
  exportInfo: {
    dateRange: {
      start: string;
      end: string;
    };
    groupBy: GroupBy;
    exportedAt: string;
  };
}
