"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CollectionApiRequest } from "@/api-request/collection";
import type { AdminCollection } from "@/types/collection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Pencil, Trash2, Eye, TriangleAlert } from "lucide-react";

function getBookCount(value?: AdminCollection["bookIds"], totalBooks?: number): number {
  if (typeof totalBooks === "number") return totalBooks;
  if (Array.isArray(value)) return value.length;
  return 0;
}

export default function CollectionsManagement() {
  const [items, setItems] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await CollectionApiRequest.adminGetCollections();
      if (!res || !res.payload?.success) {
        throw new Error(res?.payload?.message || "Failed to load collections");
      }

      setItems(Array.isArray(res.payload.data) ? res.payload.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load collections");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCollections();
  }, []);

  const onDelete = async (item: AdminCollection) => {
    if (!confirm(`Delete collection \"${item.name}\"?`)) return;

    try {
      setError(null);
      const res = await CollectionApiRequest.adminDelete(item._id);
      if (!res || !res.payload?.success) {
        throw new Error(res?.payload?.message || "Delete collection failed");
      }
      await loadCollections();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete collection failed");
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Collection Management</h2>
        <p className="text-muted-foreground">Manage collections in admin area</p>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            Add collection
          </Link>
        </Button>
      </div>

      {error && (
        <Alert className="bg-destructive/10 text-destructive border-none">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Operation failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Collections</CardTitle>
            <Badge variant="secondary">{items.length} items</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading collections...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Books</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.slug}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 1 ? "default" : "secondary"}>
                        {item.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getBookCount(item.bookIds, item.totalBooks)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/collections/${item._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/collections/${item._id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
