import { SidebarInset } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import BlogCommentsTable from "./blog-comments-table";

export default function BlogCommentsManagementPage() {
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
                <BreadcrumbPage>Blog Comments</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý bình luận blog</h1>
            <p className="text-muted-foreground">
              Theo dõi, tìm kiếm, lọc và kiểm duyệt bình luận trong blog
            </p>
          </div>

          <BlogCommentsTable />
        </div>
      </div>
    </SidebarInset>
  );
}
