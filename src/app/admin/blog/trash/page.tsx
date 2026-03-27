import { SidebarInset } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BlogsTable from "../blogs-table";

export default function BlogTrashPage() {
  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b px-6 bg-background">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/blog">Blog Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Trash</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Blog Trash</h1>
              <p className="text-muted-foreground">List of deleted posts</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin/blog">
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
          </div>

          <BlogsTable deletedOnly />
        </div>
      </div>
    </SidebarInset>
  );
}
