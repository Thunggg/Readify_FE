"use client";

import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { RefreshCcw, Search, ShoppingCart, TicketX, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { WishlistIcon } from "@/components/shared/wishlist-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BookApiRequest } from "@/api-request/book";
import type { BookSuggestion } from "@/types/book";
import { authApiRequest } from "@/api-request/auth";
import { SessionsDialog } from "@/app/admin/layouts/sessions-dialog";
import { useCurrentUser } from "@/contexts/user-context";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setSuggestions] = useState<BookSuggestion[]>([]);
  const [, setLoadingSuggest] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  const { currentUser, loading, setCurrentUser } = useCurrentUser();

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Sync search query from URL when on products page
  useEffect(() => {
    if (pathname === "/products") {
      const urlSearch = searchParams.get("q") || "";
      setSearchQuery(urlSearch);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const res = await BookApiRequest.getSuggestions(
          { q: searchQuery, limit: 6 },
          ""
        );

        const data = res?.payload.data;

        if (Array.isArray(data)) {
          setSuggestions(data);
        } else {
          console.error("Suggest API error:", data);
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Suggestion error", err);
      } finally {
        setLoadingSuggest(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleLogout = async () => {
    await authApiRequest.logoutFromNextClientToServer();
    setCurrentUser(null);
    setSessionsOpen(false);
    router.push("/login");
  };

  const handleProfile = async () => {
    router.push("/profile");
  };

  const displayName =
    (currentUser?.firstName || currentUser?.lastName)
      ? `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim()
      : (currentUser as any)?.name ||
        (typeof currentUser?.email === "string"
          ? currentUser.email.split("@")[0]
          : "Guest");

  const fallbackText = (() => {
    const s =
      (currentUser?.firstName?.[0] || "") + (currentUser?.lastName?.[0] || "");
    if (s.trim().length >= 1) return s.toUpperCase();
    if (currentUser?.email) return currentUser.email[0]?.toUpperCase() ?? "U";
    return "G";
  })();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Readify logo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="text-xl font-bold">Readify</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search books, authors, ISBN..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Suggestions */}
          {/* {suggestions.length > 0 && (
            <div className="absolute z-50 mt-2 w-full rounded-md border bg-background shadow-lg">
              <ul className="divide-y">
                {suggestions.map((item) => (
                  <li
                    key={item._id}
                    className="cursor-pointer px-3 py-2 hover:bg-muted"
                    onClick={() => {
                      router.push(`/book/${item.slug}`);
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                  >
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.authors?.map((a) => a.name).join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* Empty state */}
          {/* {searchQuery && !loadingSuggest && suggestions.length === 0 && (
            <div className="absolute z-50 mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
              No results found
            </div>
          )} */}
        </form>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/products">Products</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/blog">Blog</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/about">About Us</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/contact">Contact</Link>
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Wishlist */}
          <WishlistIcon />

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                3
              </span>
            </Link>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={currentUser?.avatarUrl || "/placeholder.svg?height=32&width=32"}
                    alt="User avatar"
                  />
                  <AvatarFallback>{fallbackText}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {loading ? (
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Loading...</p>
                    <p className="text-xs text-muted-foreground">Please wait</p>
                  </div>
                </DropdownMenuLabel>
              ) : currentUser ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleProfile}
                    className="cursor-pointer"
                  >
                    <div className="cursor-pointer flex items-center gap-2">
                      <User className="mr-2 h-4 w-4" />
                      Account Profile
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile?tab=orders" className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/support/tickets" className="cursor-pointer">
                      <TicketX className="mr-2 h-4 w-4" />
                      My Tickets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setSessionsOpen(true);
                    }}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    My Sessions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Guest</p>
                      <p className="text-xs text-muted-foreground">
                        Sign in to continue
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="cursor-pointer">
                      Đăng nhập
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="cursor-pointer">
                      Đăng ký
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>

      {currentUser ? (
        <SessionsDialog open={sessionsOpen} onOpenChange={setSessionsOpen} />
      ) : null}
    </header>
  );
}
