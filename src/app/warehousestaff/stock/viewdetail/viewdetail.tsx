"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Book = {
  _id?: string;
  title?: string;
  author?: string;
  isbn?: string;
  description?: string;
  coverUrl?: string;
};

type StockDetail = {
  stock: any;
  book?: Book | null;
};

export default function StockDetailView() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params?.get("id");

  const [data, setData] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOne = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/stocks/${id}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        setData(json as StockDetail);
      } catch (e: any) {
        setError(e.message ?? "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  if (!id) return <div className="p-4">No stock id provided.</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-6">No data.</div>;

  const { stock, book } = data;

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold">Stock detail</h2>
          <div className="text-sm text-slate-500">Detailed information and actions</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="px-3 py-2 bg-slate-800 text-white rounded-md">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-medium mb-4">Inventory</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="space-y-1"><div className="text-slate-500">Title</div><div className="font-medium">{book?.title ?? '—'}</div></div>
            <div className="space-y-1"><div className="text-slate-500">ISBN</div><div className="font-medium">{book?.isbn ?? '—'}</div></div>
            <div className="space-y-1"><div className="text-slate-500">Quantity</div><div className={`font-medium ${stock.quantity && stock.quantity <= 5 ? 'text-red-600' : ''}`}>{stock.quantity ?? 0}</div></div>
            <div className="space-y-1"><div className="text-slate-500">Location</div><div className="font-medium">{stock.location ?? '-'}</div></div>
            <div className="space-y-1"><div className="text-slate-500">Price</div><div className="font-medium">{stock.price ? new Intl.NumberFormat('vi-VN').format(stock.price) + '₫' : '-'}</div></div>
            <div className="space-y-1"><div className="text-slate-500">Batch</div><div className="font-medium">{stock.batch ?? '-'}</div></div>
            <div className="space-y-1"><div className="text-slate-500">Last updated</div><div className="font-medium">{stock.lastUpdated ?? '-'}</div></div>
            <div className="space-y-1"><div className="text-slate-500">Status</div><div className="font-medium">{stock.status ?? '-'}</div></div>
          </div>
        </div>

        <aside className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-medium mb-3">Book</h3>
          {book ? (
            <div className="space-y-4">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-48 object-cover rounded" />
              ) : (
                <div className="w-full h-48 bg-slate-100 rounded flex items-center justify-center text-slate-400">No cover</div>
              )}
              <div>
                <div className="text-lg font-medium">{book.title}</div>
                <div className="text-sm text-slate-500">{book.author}</div>
                <div className="mt-2 text-sm text-slate-700">{book.description}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No book info available for this stock item.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
