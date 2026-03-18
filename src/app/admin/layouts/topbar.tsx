"use client";
import { Bell, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  StockApiRequest,
  type StockAlertsData,
} from "@/api-request/stock";
import {
  DEFAULT_STOCK_ALERT_THRESHOLD,
  clampStockAlertThreshold,
  getStockAlertThreshold,
  setStockAlertThreshold,
} from "@/lib/stock-alert-threshold";

interface UserInfo {
  email?: string;
  name?: string;
  role?: number;
}

export function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockAlerts, setStockAlerts] = useState<StockAlertsData | null>(null);
  const [loadingStockAlerts, setLoadingStockAlerts] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(DEFAULT_STOCK_ALERT_THRESHOLD);
  const [alertThresholdInput, setAlertThresholdInput] = useState(String(DEFAULT_STOCK_ALERT_THRESHOLD));

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("http://localhost:3000/accounts/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.data || data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const currentThreshold = getStockAlertThreshold();
    setAlertThreshold(currentThreshold);
    setAlertThresholdInput(String(currentThreshold));

    const handleThresholdChanged = () => {
      const nextThreshold = getStockAlertThreshold();
      setAlertThreshold(nextThreshold);
      setAlertThresholdInput(String(nextThreshold));
    };

    window.addEventListener("storage", handleThresholdChanged);
    window.addEventListener("stock-alert-threshold-updated", handleThresholdChanged);

    return () => {
      window.removeEventListener("storage", handleThresholdChanged);
      window.removeEventListener("stock-alert-threshold-updated", handleThresholdChanged);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchStockAlerts = async () => {
      try {
        const response = await StockApiRequest.getStockAlerts(alertThreshold);
        if (!response) return;
        if (!isMounted) return;
        const payload = response.payload;
        if (payload && payload.success && payload.data) {
          setStockAlerts(payload.data);
        }
      } catch (error) {
        console.error("Failed to fetch stock alerts:", error);
      } finally {
        if (isMounted) {
          setLoadingStockAlerts(false);
        }
      }
    };

    fetchStockAlerts();
    const intervalId = setInterval(fetchStockAlerts, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [alertThreshold]);

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch("/api/logout", {
        method: "POST",
      });

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitials = (email?: string, name?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "AD";
  };

  const alertItems = stockAlerts?.items ?? [];
  const hasAlerts = alertItems.length > 0;
  const hasOutOfStock = (stockAlerts?.outOfStockCount ?? 0) > 0;

  const applyAlertThreshold = () => {
    const normalized = clampStockAlertThreshold(Number(alertThresholdInput));
    setStockAlertThreshold(normalized);
    setAlertThreshold(normalized);
    setAlertThresholdInput(String(normalized));
  };

  return (
    <div className="flex h-16 items-center justify-between border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Search */}
      <div className="flex items-center max-w-2xl flex-1">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2 h-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 hover:bg-muted transition-colors"
              aria-label="Stock alerts"
            >
              <Bell
                className={cn(
                  "h-4 w-4",
                  hasOutOfStock && "animate-bounce text-red-500"
                )}
              />
              {hasAlerts && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
                  {alertItems.length > 99 ? "99+" : alertItems.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] p-0">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold">Stock Alerts</p>
              <p className="text-xs text-muted-foreground mt-1">
                {loadingStockAlerts
                  ? "Loading alerts..."
                  : hasAlerts
                    ? `${stockAlerts?.outOfStockCount ?? 0} out of stock, ${stockAlerts?.lowStockCount ?? 0} low stock`
                    : "No low or out-of-stock products"}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={alertThresholdInput}
                  onChange={(e) => setAlertThresholdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyAlertThreshold();
                    }
                  }}
                  className="h-8"
                />
                <Button size="sm" variant="secondary" onClick={applyAlertThreshold}>
                  Set
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Alert threshold: {alertThreshold}
              </p>
            </div>

            {loadingStockAlerts ? (
              <DropdownMenuItem disabled className="py-4">
                Loading stock alerts...
              </DropdownMenuItem>
            ) : !hasAlerts ? (
              <DropdownMenuItem disabled className="py-4">
                Inventory levels are healthy.
              </DropdownMenuItem>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {alertItems.slice(0, 8).map((item) => (
                  <DropdownMenuItem key={item.stockId} asChild>
                    <Link
                      href={`/admin/stock/${item.stockId}`}
                      className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                    >
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-sm font-medium line-clamp-1">
                          {item.book.title}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            item.level === "OUT_OF_STOCK"
                              ? "text-red-500"
                              : "text-amber-600"
                          )}
                        >
                          {item.level === "OUT_OF_STOCK"
                            ? "Out of stock"
                            : "Low stock"}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Qty: {item.quantity} • ISBN: {item.book.isbn || "-"}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/stock/viewlist" className="justify-center py-3 font-medium">
                View stock list
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild suppressHydrationWarning>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full hover:bg-muted transition-colors"
            >
              <Avatar className="h-8 w-8 ring-2 ring-background">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {loading ? "..." : getUserInitials(user?.email, user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {loading ? "..." : getUserInitials(user?.email, user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {loading ? "Loading..." : user?.name || "Admin"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {loading ? "" : user?.email || "admin@example.com"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-md transition-colors">
              <span className="flex items-center gap-2">👤 Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-md transition-colors">
              <span className="flex items-center gap-2">⚙️ Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 cursor-pointer hover:bg-muted rounded-md transition-colors">
              <span className="flex items-center gap-2">💳 Billing</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" /> */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="p-3 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
