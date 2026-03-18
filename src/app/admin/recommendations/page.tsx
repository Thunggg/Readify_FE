"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookApiRequest } from "@/api-request/book";
import type { AdminTrendingBook } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, RefreshCcw, Star, TrendingUp, TriangleAlert } from "lucide-react";

type TrendingResponseMeta = {
  generatedAt: string;
  sourceSummary: {
    internal: boolean;
    web: boolean;
  };
};

export default function AdminRecommendationsPage() {
  const [items, setItems] = useState<AdminTrendingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(8);
  const [includeWebData, setIncludeWebData] = useState(true);
  const [meta, setMeta] = useState<TrendingResponseMeta | null>(null);

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await BookApiRequest.getTrendingRecommendations({
        limit,
        includeWebData,
      });

      if (!response) {
        throw new Error("No response from recommendation service");
      }

      const payload = response.payload as any;
      if (!payload?.success) {
        throw new Error(payload?.message || "Failed to fetch recommendations");
      }

      setItems(payload?.data?.items || []);
      setMeta({
        generatedAt: payload?.data?.generatedAt,
        sourceSummary: payload?.data?.sourceSummary,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch recommendations");
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [includeWebData, limit]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const highestScore = useMemo(() => {
    if (items.length === 0) return 1;
    return Math.max(...items.map((item) => item.score), 1);
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7" />
            Trending Recommendations
          </h1>
          <p className="text-muted-foreground mt-1">
            Books are ranked by purchase signals, 5-star reviews, recency, and optional web data.
          </p>
        </div>
        <Button onClick={fetchTrending} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Adjust settings and recalculate recommendation ranking.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="limit">Number of books (1-20)</Label>
            <Input
              id="limit"
              type="number"
              min={1}
              max={20}
              value={limit}
              onChange={(e) => {
                const next = Number(e.target.value || 1);
                const normalized = Math.max(1, Math.min(20, next));
                setLimit(normalized);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="web-data">Use web data signal</Label>
            <div className="flex items-center gap-3 rounded-md border p-2.5">
              <Switch id="web-data" checked={includeWebData} onCheckedChange={setIncludeWebData} />
              <span className="text-sm text-muted-foreground">
                {includeWebData ? "Enabled (Google Books)" : "Disabled (Internal data only)"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Last generated</Label>
            <div className="rounded-md border p-2.5 text-sm text-muted-foreground">
              {meta?.generatedAt ? new Date(meta.generatedAt).toLocaleString("vi-VN") : "-"}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="bg-destructive/10 text-destructive border-none">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Cannot load recommendations</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Recommended Books</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{items.length} books</Badge>
                <Badge variant="outline">
                  {meta?.sourceSummary?.web ? "Internal + Web" : "Internal only"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Calculating recommendation scores...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recommendation results yet.</p>
            ) : (
              items.map((item, index) => {
                const scorePercent = Math.round((item.score / highestScore) * 100);

                return (
                  <div key={item._id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <Link href={`/admin/books/${item._id}`} className="font-semibold hover:underline">
                            {item.title}
                          </Link>
                        </div>
                        <div className="text-xs text-muted-foreground">ISBN: {item.isbn || "-"}</div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-sm font-semibold flex items-center justify-end gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {item.score.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Internal {item.internalScore.toFixed(2)} | Web {item.externalScore.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${scorePercent}%` }} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="rounded border p-2">Sold: {item.soldCount}</div>
                      <div className="rounded border p-2">Recent buys: {item.recentPurchasedQty}</div>
                      <div className="rounded border p-2 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        5-star: {item.fiveStarCount}
                      </div>
                      <div className="rounded border p-2">Avg rating: {item.avgRating.toFixed(2)}</div>
                    </div>

                    {item.trendReasons?.length > 0 && (
                      <>
                        <Separator />
                        <div className="flex flex-wrap gap-2">
                          {item.trendReasons.map((reason) => (
                            <Badge key={reason} variant="secondary">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
