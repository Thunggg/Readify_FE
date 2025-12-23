"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Stock = {
  _id?: string;
  bookId?: string;
  book?: { title?: string; isbn?: string } | null;
  quantity?: number;
  location?: string;
  price?: number;
  batch?: string;
};

export default function StockListView() {
  const [items, setItems] = useState<Stock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/stocks");
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setItems(data as Stock[]);
      } catch (e: any) {
        setError(e.message ?? "Fetch error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-28 bg-white rounded-lg shadow" />
            <div className="h-28 bg-white rounded-lg shadow" />
          </div>
        </div>
      </div>
    );
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!items || items.length === 0)
    return <div className="p-6 text-slate-600">No stock items found.</div>;

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold">Stock inventory</h2>
          <div className="text-sm text-slate-500">Overview of current stock</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500">{items.length} items</div>
          <Link href="/warehousestaff/stock/add" className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-md text-sm shadow">
            + Import stock
          </Link>
          <Link href="/warehousestaff/stock/add" className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-md text-sm shadow">
            - Export stock
          </Link>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => {
          const low = (it.quantity ?? 0) <= 5;
          return (
            <li
              key={it._id}
              className="bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-medium text-slate-800">
                      {it.book?.title ?? it.bookId ?? "(no title)"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{it.book?.isbn ? `ISBN: ${it.book.isbn}` : `Location: ${it.location ?? "-"}`}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Price</div>
                    <div className="mt-1 font-medium">{it.price ? new Intl.NumberFormat('vi-VN').format(it.price) + '₫' : '-'}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    low ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    Qty: {it.quantity ?? 0}
                  </span>
                  <span className="text-xs text-slate-400">Batch: {it.batch ?? '-'}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Link
                  href={`/warehousestaff/stock/viewdetail?id=${it._id}`}
                  className="inline-flex items-center px-3 py-2 bg-sky-600 text-white rounded-md text-sm"
                >
                  View details
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
