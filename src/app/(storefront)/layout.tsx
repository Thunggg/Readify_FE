import type React from "react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import CurrentUserProvider from "@/contexts/user-context";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurrentUserProvider>
      <div className="theme-store min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background">{children}</main>
        <Footer />
      </div>
    </CurrentUserProvider>
  );
}
