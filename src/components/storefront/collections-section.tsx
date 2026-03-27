"use client";

import Link from "next/link";
import { ArrowRight, Baby, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const collections = [
  {
    title: "Children's Books",
    description: "Comics, life skills, and thinking-development books for kids.",
    href: "/category/thieu-nhi",
    icon: Baby,
    accent: "from-pink-500/15 via-pink-500/5 to-transparent",
    iconWrap: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  },
  {
    title: "Business & Economics",
    description: "Economics, finance, and management mindset for professionals.",
    href: "/category/kinh-te",
    icon: TrendingUp,
    accent: "from-cyan-500/15 via-cyan-500/5 to-transparent",
    iconWrap: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  },
];

export function CollectionsSection() {
  return (
    <section className="container py-8">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Collections</h2>
          <p className="text-muted-foreground">
            Featured collections curated for you.
          </p>
        </div>
        <Button variant="outline" asChild className="h-9">
          <Link href="/discover">View all</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href} className="group">
              <Card className="relative h-full overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div
                    className={`pointer-events-none absolute inset-0 bg-linear-to-br ${c.accent}`}
                  />
                  <div className="relative flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={`inline-flex size-10 items-center justify-center rounded-lg ${c.iconWrap}`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <h3 className="text-lg font-semibold">{c.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {c.description}
                      </p>

                      <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                        Explore now
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

