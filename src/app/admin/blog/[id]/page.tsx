"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Pencil, Eye, MessageCircle, Calendar } from "lucide-react";

import { BlogApiRequest } from "@/api-request/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
};

export default function BlogDetailPage() {
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
              <BreadcrumbPage>{blog?.title || "Chi tiết"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu bài viết...</p>
        ) : !blog ? (
          <p className="text-sm text-muted-foreground">Không tìm thấy bài viết</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{blog.title}</h1>
                <p className="text-muted-foreground">{blog.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/admin/blog-comments?postId=${blog._id}`}>
                    <MessageCircle className="mr-2 size-4" />
                    Xem bình luận bài này
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/admin/blog/${blog._id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    Chỉnh sửa
                  </Link>
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin tổng quan</CardTitle>
                <CardDescription>Trạng thái hiển thị và metadata bài viết</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant={statusVariant[blog.status] ?? "secondary"}>{blog.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lượt xem</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Eye className="size-4" />
                    {blog.viewCount ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bình luận</p>
                  <p className="font-semibold flex items-center gap-1">
                    <MessageCircle className="size-4" />
                    {blog.commentCount ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="size-4" />
                    {dayjs(blog.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent>
                {blog.featuredImage ? (
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full max-w-2xl rounded-lg border object-cover"
                  />
                ) : (
                  <div className="h-40 w-full max-w-2xl rounded-lg border bg-muted flex items-center justify-center text-muted-foreground">
                    Không có ảnh
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nội dung bài viết</CardTitle>
                <CardDescription>
                  {blog.category?.name ? `Danh mục: ${blog.category.name}` : "Không có danh mục"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {blog.excerpt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tóm tắt</p>
                    <p>{blog.excerpt}</p>
                  </div>
                )}

                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SidebarInset>
  );
}
