import { HeroSection } from "@/components/storefront/hero-section";
import { CategoryTabs } from "@/components/storefront/category-tabs";
import { FeaturedBooks } from "@/components/storefront/featured-books";
import { Newsletter } from "@/components/storefront/newsletter";
import { BookApiRequest } from "@/api-request/book";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const res = await BookApiRequest.getBooks(
    {
      sort: "best_selling",
      page: 1,
      limit: 12,
    },
    accessToken ?? ""
  );

  const books = res.payload.success ? res.payload.data.items : [];
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />
        <CategoryTabs />
        <FeaturedBooks books={books} />
        {/* <Newsletter /> */}
      </main>
    </div>
  );
}
