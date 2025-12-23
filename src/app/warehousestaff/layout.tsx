import React from "react";
import WarehouseSidebar from "./layouts/sidebar";

export const metadata = {
  title: "Warehouse",
};

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <WarehouseSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
