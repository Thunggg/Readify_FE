"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CollectionApiRequest } from "@/api-request/collection";
import type { AdminCollection } from "@/types/collection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, Pencil } from "lucide-react";

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const [item, setItem] = useState<AdminCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await CollectionApiRequest.adminGetById(id);
        if (!res || !res.payload?.success) {
          throw new Error(res?.payload?.message || "Load collection detail failed");
        }

        setItem(res.payload.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Load collection detail failed");
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) return <div className="py-6">Loading...</div>;

  if (error || !item) {
    return (
      <div className="py-6">
        <Alert className="bg-destructive/10 text-destructive border-none">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Cannot load collection</AlertTitle>
          <AlertDescription>{error || "Collection not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const books = Array.isArray(item.bookIds) ? item.bookIds : [];

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Collection Detail</h2>
          <p className="text-muted-foreground">View collection info and books</p>
        </div>
        <Button asChild>
          <Link href={`/admin/collections/${item._id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit collection
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><span className="font-medium">Slug:</span> {item.slug}</div>
          <div><span className="font-medium">Status:</span> <Badge variant={item.status === 1 ? "default" : "secondary"}>{item.status === 1 ? "Active" : "Inactive"}</Badge></div>
          <div><span className="font-medium">Sort Order:</span> {item.sortOrder}</div>
          <div><span className="font-medium">Description:</span> {item.description || "-"}</div>
          <div><span className="font-medium">Cover Image:</span> {item.coverImageUrl || "-"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Books ({books.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {books.length === 0 ? (
            <p className="text-sm text-muted-foreground">No books in this collection.</p>
          ) : (
            <div className="space-y-2">
              {books.map((book, index) => {
                if (typeof book === "string") {
                  return <p key={book} className="text-sm">{index + 1}. {book}</p>;
                }
                return (
                  <p key={book._id} className="text-sm">
                    {index + 1}. {book.title || "Untitled"} ({book._id})
                  </p>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
