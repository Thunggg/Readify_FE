"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { BlogApiRequest } from "@/api-request/blog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import { handleErrorApi } from "@/lib/utils";
import type { AdminBlogPostDetail } from "@/types/blog";
import BlogPostForm from "../../components/blog-post-form";

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [blog, setBlog] = useState<AdminBlogPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    if (!id || typeof id !== "string") return;

    let cancelled = false;

    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const res = await BlogApiRequest.getAdminBlogDetail(id);
        if (!res) {
          handleErrorApi({ error: "Không thể tải bài viết" });
          router.push("/admin/blog");
          return;
        }

        if (!res.payload.success) {
          handleErrorApi({ error: res.payload.message });
          router.push("/admin/blog");
          return;
        }

        if (!cancelled) {
          setBlog(res.payload.data as AdminBlogPostDetail);
        }
      } catch (error) {
        if (!cancelled) {
          handleErrorApi({ error });
          router.push("/admin/blog");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchBlog();
    return () => {
      cancelled = true;
    };
  }, [params?.id, router]);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 h-4" />
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
              <BreadcrumbPage>Chỉnh sửa bài viết</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa bài viết blog</h1>
          <p className="text-muted-foreground">Cập nhật nội dung, ảnh và trạng thái bài viết</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu bài viết...</p>
        ) : !blog ? (
          <p className="text-sm text-muted-foreground">Không tìm thấy bài viết</p>
        ) : (
          <BlogPostForm mode="edit" initialData={blog} />
        )}
      </div>
    </SidebarInset>
  );
}
