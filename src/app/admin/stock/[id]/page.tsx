"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  TriangleAlert,
  Package,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
  BookOpen,
  Layers,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DEFAULT_STOCK_ALERT_THRESHOLD,
  getStockAlertThreshold,
} from "@/lib/stock-alert-threshold";
import { StockApiRequest } from "@/api-request/stock";

type Book = {
  _id?: string;
  title?: string;
  author?: string;
  isbn?: string;
  description?: string;
  coverUrl?: string;
  categories?: string[];
  publishedDate?: string;
  pages?: number;
  publisher?: string;
};

type Stock = {
  _id?: string;
  bookId?: string;
  quantity?: number;
  location?: string;
  price?: number;
  batch?: string;
  lastUpdated?: string;
  status?: string;
  updatedAt?: string;
  book?: Book | null;
};

type EditStockForm = {
  quantity: string;
  location: string;
  price: string;
  batch: string;
  status: string;
};

const normalizeStockData = (raw: any): Stock => {
  const book =
    raw?.bookId && typeof raw.bookId === "object" ? raw.bookId : raw?.book;

  return {
    ...raw,
    bookId: typeof raw?.bookId === "string" ? raw.bookId : raw?.bookId?._id,
    book: book
      ? {
          _id: book._id,
          title: book.title,
          author: Array.isArray(book.authors)
            ? book.authors.join(", ")
            : book.author,
          isbn: book.isbn,
          description: book.description,
          coverUrl: book.thumbnailUrl || book.coverUrl,
          categories: Array.isArray(book.categoryIds)
            ? book.categoryIds
            : book.categories,
          publishedDate: book.publishDate || book.publishedDate,
          pages: book.pageCount || book.pages,
          publisher: book.publisherId || book.publisher,
        }
      : null,
  };
};

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertThreshold, setAlertThreshold] = useState(
    DEFAULT_STOCK_ALERT_THRESHOLD,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditStockForm>({
    quantity: "0",
    location: "",
    price: "0",
    batch: "",
    status: "available",
  });

  const fillEditForm = (stock: Stock) => {
    setEditForm({
      quantity: String(stock.quantity ?? 0),
      location: stock.location ?? "",
      price: String(stock.price ?? 0),
      batch: stock.batch ?? "",
      status: stock.status ?? "available",
    });
  };

  useEffect(() => {
    const syncThreshold = () => setAlertThreshold(getStockAlertThreshold());
    syncThreshold();
    window.addEventListener("storage", syncThreshold);
    window.addEventListener("stock-alert-threshold-updated", syncThreshold);

    return () => {
      window.removeEventListener("storage", syncThreshold);
      window.removeEventListener(
        "stock-alert-threshold-updated",
        syncThreshold,
      );
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchOne = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/stocks/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        const stockData = json.data || json;
        const normalized = normalizeStockData(stockData);
        setData(normalized);
        fillEditForm(normalized);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  if (!id) {
    return (
      <div className="container max-w-7xl py-8">
        <Alert className="bg-destructive/10 text-destructive border-none">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Missing ID</AlertTitle>
          <AlertDescription className="text-destructive/80">
            No stock ID provided.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-7xl py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full aspect-2/3 rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl py-8">
        <Alert className="bg-destructive/10 text-destructive border-none">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Load failed</AlertTitle>
          <AlertDescription className="text-destructive/80">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || !data._id) {
    return (
      <div className="container max-w-7xl py-8">
        <Alert>
          <Package className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>Stock item not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const book = data.book;
  const isLowStock =
    data.quantity !== undefined && data.quantity <= alertThreshold;

  const startEdit = () => {
    fillEditForm(data);
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    fillEditForm(data);
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!id) return;

    const quantityNum = Number(editForm.quantity);
    const priceNum = Number(editForm.price);

    if (!Number.isFinite(quantityNum) || quantityNum < 0) {
      setSaveError("Quantity must be a non-negative number");
      return;
    }

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setSaveError("Price must be a non-negative number");
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const response = await StockApiRequest.updateStock(id, {
        quantity: quantityNum,
        location: editForm.location.trim(),
        price: priceNum,
        batch: editForm.batch.trim(),
        status: editForm.status.trim() || "available",
      });

      if (!response) {
        throw new Error("No response from server");
      }

      const payload = response.payload as any;
      if (!payload?.success) {
        throw new Error(payload?.message || "Failed to update stock item");
      }

      const updatedStock = normalizeStockData(payload.data || payload);
      setData(updatedStock);
      fillEditForm(updatedStock);
      setIsEditing(false);
    } catch (e: unknown) {
      setSaveError(
        e instanceof Error ? e.message : "Failed to update stock item",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/stock/viewlist")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Stock Details
              </h1>
              <p className="text-muted-foreground">
                View and manage inventory information
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Stock
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Stock</CardTitle>
            <CardDescription>
              Update quantity, location, price, batch and status.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                min={0}
                value={editForm.quantity}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, quantity: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                min={0}
                value={editForm.price}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-batch">Batch</Label>
              <Input
                id="edit-batch"
                value={editForm.batch}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, batch: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-status">Status</Label>
              <Input
                id="edit-status"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, status: e.target.value }))
                }
                placeholder="available"
              />
            </div>
            {saveError && (
              <div className="md:col-span-2">
                <Alert className="bg-destructive/10 text-destructive border-none">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Update failed</AlertTitle>
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isLowStock && (
        <Alert className="bg-destructive/10 text-destructive border-none">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Low Stock Warning</AlertTitle>
          <AlertDescription className="text-destructive/80">
            This item has only {data.quantity} units remaining. Consider
            restocking soon. Current threshold is {alertThreshold}.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Information
              </CardTitle>
              <CardDescription>
                Current stock details and warehouse location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    Quantity
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {data.quantity ?? 0}
                    </span>
                    <Badge
                      variant={isLowStock ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {isLowStock ? "Low Stock" : "In Stock"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </div>
                  <div className="text-lg font-semibold">
                    {data.location || "Not assigned"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Unit Price
                  </div>
                  <div className="text-lg font-semibold">
                    {data.price
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(data.price)
                      : "Not set"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Batch Number
                  </div>
                  <Badge variant="outline" className="text-sm font-mono">
                    {data.batch || "N/A"}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Last Updated
                  </div>
                  <div className="text-sm">
                    {data.lastUpdated
                      ? new Date(data.lastUpdated).toLocaleString("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Unknown"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    Status
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {data.status || "Active"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Book Information Card */}
          {book && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Book Details
                </CardTitle>
                <CardDescription>
                  Information about the associated book
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Title
                    </div>
                    <div className="text-lg font-semibold">
                      {book.title || "—"}
                    </div>
                  </div>

                  {book.author && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Author
                      </div>
                      <div className="text-base">{book.author}</div>
                    </div>
                  )}

                  {book.isbn && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        ISBN
                      </div>
                      <div className="font-mono text-sm">{book.isbn}</div>
                    </div>
                  )}

                  {book.publisher && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Publisher
                      </div>
                      <div className="text-base">{book.publisher}</div>
                    </div>
                  )}

                  {book.publishedDate && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Published Date
                      </div>
                      <div className="text-base">
                        {new Date(book.publishedDate).toLocaleDateString(
                          "vi-VN",
                        )}
                      </div>
                    </div>
                  )}

                  {book.pages && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Pages
                      </div>
                      <div className="text-base">{book.pages} pages</div>
                    </div>
                  )}

                  {book.categories && book.categories.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Categories
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {book.categories.map((cat, idx) => (
                          <Badge key={idx} variant="secondary">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {book.description && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          Description
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {book.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Book Cover Card */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              {book?.coverUrl ? (
                <div className="w-full aspect-2/3 bg-muted rounded-lg overflow-hidden border">
                  <img
                    src={book.coverUrl}
                    alt={book.title || "Book cover"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-2/3 bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground border border-dashed">
                  <Package className="h-16 w-16 mb-2" />
                  <span className="text-sm">No cover image</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Value
                </span>
                <span className="font-semibold">
                  {data.price && data.quantity
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(data.price * data.quantity)
                    : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stock ID</span>
                <span className="font-mono text-xs">{data._id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
