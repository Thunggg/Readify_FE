"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export default function WarehouseSidebar() {
	const pathname = usePathname();
	const items = [
		{ href: "/warehousestaff", label: "Dashboard" },
		{ href: "/warehousestaff/stock/viewlist", label: "Stock list" },
		{ href: "/warehousestaff/stock/add", label: "Add stock" },
		{ href: "/warehousestaff/stock/movements", label: "Stock movements" },
		{ href: "/warehousestaff/orders", label: "Orders" },
		{ href: "/warehousestaff/settings", label: "Settings" },
	];

	return (
		<aside className="w-72 min-h-screen border-r border-slate-800 bg-slate-900 p-6 text-slate-100">
			<div className="mb-6 flex items-center gap-3">
				<div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">W</div>
				<div>
					<div className="text-lg font-semibold text-white">Warehouse</div>
					<div className="text-xs text-slate-300">Inventory management</div>
				</div>
			</div>

			<div className="mb-4">
				<label className="relative block">
					<span className="sr-only">Search</span>
					<input
						className="placeholder:text-slate-400 bg-slate-800 text-slate-100 w-full rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
						placeholder="Search..."
						aria-label="Search"
					/>
					<span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">⌕</span>
				</label>
			</div>

			<nav className="flex flex-col gap-1">
				{items.map((it) => {
					const active = pathname === it.href || pathname?.startsWith(it.href + "/");
					return (
						<Link
							key={it.href}
							href={it.href}
							className={`relative flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
								active
									? "bg-slate-800 text-white"
									: "text-slate-200 hover:bg-slate-800 hover:text-white"
							}`}
						>
							{/* left active strip */}
							<span className={`absolute left-0 top-1/2 -translate-y-1/2 h-3 w-1 rounded-r ${active ? 'bg-sky-500' : 'bg-transparent'}`} />
							<span className="flex-1">{it.label}</span>
						</Link>
					);
				})}
			</nav>

			<div className="mt-8 text-xs text-slate-400">v0.1 · Readify</div>
		</aside>
	);
}
