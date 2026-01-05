import type React from "react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-store min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
