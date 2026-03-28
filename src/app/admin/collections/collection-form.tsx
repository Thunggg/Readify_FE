"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CollectionApiRequest } from "@/api-request/collection";
import type {
  AdminCollection,
  CreateCollectionBody,
  UpdateCollectionBody,
} from "@/types/collection";
import type { ApiResponse, PaginatedData } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, Save, TriangleAlert } from "lucide-react";
import http from "@/lib/http";

type AdminBookOption = {
  _id: string;
  title: string;
  slug?: string;
  status?: number;
};

type FormState = {
  name: string;
  description: string;
  status: boolean;
};

const initialForm: FormState = {
  name: "",
  description: "",
  status: true,
};

type CollectionFormProps = {
  mode: "create" | "edit";
  collectionId?: string;
};

export default function CollectionForm({ mode, collectionId }: CollectionFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  const [bookQuery, setBookQuery] = useState("");
  const [books, setBooks] = useState<AdminBookOption[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);

  const title = useMemo(() => (mode === "create" ? "Add Collection" : "Edit Collection"), [mode]);

  const loadBooks = async (q?: string) => {
    try {
      setBooksLoading(true);
      const res = await http.get<ApiResponse<PaginatedData<AdminBookOption>>>("/admin/book", {
        params: {
          page: 1,
          limit: 50,
          q: q?.trim() || undefined,
        },
        credentials: "include",
        cache: "no-store",
      });

      if (!res || !res.payload?.success) {
        throw new Error(res?.payload?.message || "Load books failed");
      }

      const nextBooks = res.payload.data?.items ?? [];
      setBooks(Array.isArray(nextBooks) ? nextBooks : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Load books failed");
    } finally {
      setBooksLoading(false);
    }
  };

  useEffect(() => {
    void loadBooks();
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !collectionId) return;

    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await CollectionApiRequest.adminGetById(collectionId);
        if (!res || !res.payload?.success) {
          throw new Error(res?.payload?.message || "Load collection detail failed");
        }

        const data = res.payload.data as AdminCollection;
        setForm({
          name: data.name || "",
          description: data.description || "",
          status: Number(data.status ?? 1) === 1,
        });

        const ids = Array.isArray(data.bookIds)
          ? data.bookIds
              .map((book) => (typeof book === "string" ? book : book?._id || ""))
              .filter(Boolean)
          : [];
        setSelectedBookIds(ids);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Load collection detail failed");
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [mode, collectionId]);

  const toggleBookSelection = (bookId: string) => {
    setSelectedBookIds((prev) => {
      if (prev.includes(bookId)) return prev.filter((id) => id !== bookId);
      return [...prev, bookId];
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const body: CreateCollectionBody | UpdateCollectionBody = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        status: form.status ? 1 : 0,
        bookIds: selectedBookIds,
      };

      if (!body.name) {
        throw new Error("Collection name is required");
      }

      const res = mode === "create"
        ? await CollectionApiRequest.adminCreate(body as CreateCollectionBody)
        : await CollectionApiRequest.adminUpdate(collectionId!, body);

      if (!res || !res.payload?.success) {
        throw new Error(res?.payload?.message || "Save collection failed");
      }

      router.push("/admin/collections");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save collection failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-6">Loading...</div>;
  }

  return (
    <div className="py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">Create or update collection and choose books from admin list</p>
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
          <CardTitle>Collection Info</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Example: Summer Reading"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Status</Label>
              <label className="flex items-center gap-3 border rounded-md px-3 py-2 w-fit cursor-pointer">
                <input
                  id="status"
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked }))}
                />
                <span className="text-sm">Active collection</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Current status value: {form.status ? 1 : 0}
              </p>
            </div>

            <div className="md:col-span-2 border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Books in collection</Label>
                <Badge variant="secondary">{selectedBookIds.length} selected</Badge>
              </div>

              <div className="flex gap-2">
                <Input
                  value={bookQuery}
                  onChange={(e) => setBookQuery(e.target.value)}
                  placeholder="Search books by title"
                />
                <Button type="button" variant="outline" onClick={() => void loadBooks(bookQuery)}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>

              <div className="max-h-72 overflow-auto border rounded-md">
                {booksLoading ? (
                  <p className="p-3 text-sm text-muted-foreground">Loading books...</p>
                ) : books.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No books found.</p>
                ) : (
                  <div className="divide-y">
                    {books.map((book) => {
                      const checked = selectedBookIds.includes(book._id);
                      return (
                        <label key={book._id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleBookSelection(book._id)}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{book.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{book._id}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Saving..." : mode === "create" ? "Create Collection" : "Update Collection"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/collections")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
