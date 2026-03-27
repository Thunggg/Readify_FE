"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BlogApiRequest } from "@/api-request/blog";
import { BlogCategory } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import PaginationControls from "@/app/admin/staff/components/pagination-controls";
import {
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  FileText,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function AdminBlogCategoryPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Create/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<BlogCategory> | null>(null);

  // Detail Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [detailCategory, setDetailCategory] = useState<(BlogCategory & { recentPosts: any[] }) | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await BlogApiRequest.adminGetCategories({ search, page, limit });
      if (res?.payload?.success) {
        setCategories(res.payload.data.items);
        setTotal(res.payload.data.meta?.total ?? 0);
      }
    } catch {
      toast.error("Không thể tải danh sách danh mục blog");
      setCategories([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = () => {
    setEditingCategory({
      name: "",
      slug: "",
      description: "",
      icon: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingCategory({ ...category });
    setIsDialogOpen(true);
  };

  const handleViewDetail = async (category: BlogCategory) => {
    try {
      setIsSheetOpen(true);
      setIsDetailLoading(true);
      const res = await BlogApiRequest.adminGetCategoryById(category._id);
      if (res?.payload?.success) {
        setDetailCategory(res.payload.data);
      }
    } catch {
      toast.error("Không thể tải chi tiết danh mục");
      setIsSheetOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingCategory?.name || !editingCategory?.slug) {
      toast.warning("Vui lòng nhập tên và slug của danh mục");
      return;
    }

    // Only send fields that backend accepts for create/update.
    const body = {
      name: editingCategory.name,
      slug: editingCategory.slug,
      description: editingCategory.description || undefined,
      icon: editingCategory.icon || undefined,
    };

    try {
      if (editingCategory._id) {
        await BlogApiRequest.adminUpdateCategory(editingCategory._id, body);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await BlogApiRequest.adminCreateCategory(body);
        toast.success("Tạo danh mục thành công");
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu danh mục");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này? Hệ thống sẽ không cho phép xóa nếu có bài viết đang thuộc danh mục này.")) return;
    try {
      await BlogApiRequest.adminDeleteCategory(id);
      toast.success("Xóa danh mục thành công");
      fetchCategories();
    } catch {
      const msg = "Xóa danh mục thất bại";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Danh mục Blog</h1>
            <p className="text-muted-foreground">
              Quản lý các danh mục phân loại bài viết tin tức
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={fetchCategories} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Làm mới
          </Button>
          <Button size="sm" onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20">
            <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                className="pl-9 h-11 bg-background/50 border-muted-foreground/20 focus:border-purple-500 transition-all"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b">
                <TableHead className="py-4 pl-6">Tên danh mục</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Số bài viết</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="h-16 text-center text-muted-foreground animate-pulse">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-muted-foreground opacity-60">
                    <div className="flex flex-col items-center gap-3">
                      <BookOpen className="h-12 w-12 opacity-20" />
                      <p className="font-medium">Chưa có danh mục blog nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => (
                  <TableRow key={c._id} className="group hover:bg-purple-500/5 transition-colors border-b">
                    <TableCell className="py-4 font-bold text-base pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg">
                          {c.icon || "📁"}
                        </div>
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground/80">{c.slug}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 border-none px-3 py-1 font-bold">
                        {c.postCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] text-sm text-muted-foreground truncate">
                      {c.description || "---"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleViewDetail(c)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 hover:bg-purple-50" onClick={() => handleEdit(c)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(c._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > limit && (
        <div className="pt-4">
          <PaginationControls
            currentPage={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] shadow-2xl border-none p-0 overflow-hidden rounded-2xl">
          <div className="bg-purple-600 p-6 border-b text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingCategory?._id ? "Cập nhật danh mục" : "Tạo danh mục blog"}</DialogTitle>
              <DialogDescription className="text-purple-100/80">
                Lưu ý: Slug sẽ được dùng trong URL của danh mục
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-4 gap-4">
               <div className="col-span-3 space-y-2">
                <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider opacity-60">Tên danh mục</Label>
                <Input 
                  id="name" 
                  className="h-11 bg-muted/30 focus:bg-background transition-all"
                  value={editingCategory?.name} 
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  placeholder="VD: Tin tức công nghệ"
                />
              </div>
               <div className="col-span-1 space-y-2">
                <Label htmlFor="icon" className="text-sm font-bold uppercase tracking-wider opacity-60 text-center block">Icon</Label>
                <Input 
                  id="icon" 
                  className="h-11 bg-muted/30 text-center text-xl"
                  value={editingCategory?.icon} 
                  onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                  placeholder="📁"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug" className="text-sm font-bold uppercase tracking-wider opacity-60">Slug</Label>
              <Input 
                 id="slug"
                 className="h-11 bg-muted/30 focus:bg-background transition-all font-mono text-sm"
                 value={editingCategory?.slug} 
                 onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                 placeholder="VD: tin-tuc-cong-nghe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider opacity-60">Mô tả</Label>
              <Textarea 
                 id="description"
                 className="min-h-[100px] bg-muted/30 focus:bg-background transition-all"
                 value={editingCategory?.description} 
                 onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                 placeholder="Nhập mô tả ngắn cho danh mục..."
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 bg-muted/5">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 px-6 font-medium">Hủy</Button>
            <Button onClick={handleSave} className="rounded-xl bg-purple-600 hover:bg-purple-700 h-11 px-8 font-bold shadow-lg shadow-purple-600/20">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL SHEET */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg border-l p-0 overflow-hidden flex flex-col">
          {isDetailLoading ? (
             <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
                <p className="text-muted-foreground font-medium">Đang tải chi tiết...</p>
             </div>
          ) : detailCategory ? (
            <>
              <div className="bg-gradient-to-br from-purple-700 to-indigo-800 p-8 text-white relative">
                 <div className="absolute top-4 right-4 text-7xl opacity-10 leading-none">
                    {detailCategory.icon || "📁"}
                 </div>
                 <SheetHeader>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-4xl">{detailCategory.icon || "📁"}</span>
                       <Badge variant="secondary" className="bg-white/20 text-white border-none uppercase tracking-widest text-[10px]">Blog Category</Badge>
                    </div>
                    <SheetTitle className="text-3xl font-extrabold text-white">{detailCategory.name}</SheetTitle>
                    <SheetDescription className="text-purple-100/90 text-base italic leading-relaxed">
                      {detailCategory.description || "Không có mô tả cho danh mục này."}
                    </SheetDescription>
                 </SheetHeader>
              </div>

              <div className="flex-1 p-8 overflow-auto space-y-8 bg-background">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-2xl flex flex-col items-center justify-center border text-center">
                       <span className="text-3xl font-black text-purple-600">{detailCategory.postCount || 0}</span>
                       <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Tổng bài viết</span>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-2xl flex flex-col items-center justify-center border text-center">
                       <span className="text-xs font-mono text-muted-foreground overflow-hidden text-ellipsis w-full">/{detailCategory.slug}</span>
                       <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Đường dẫn</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-lg font-bold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-purple-600" />
                          Bài viết mới nhất
                       </h3>
                       <Badge variant="outline" className="rounded-full">Top 10</Badge>
                    </div>

                    <div className="space-y-3">
                       {detailCategory.recentPosts && detailCategory.recentPosts.length > 0 ? (
                          detailCategory.recentPosts.map((post) => (
                             <div key={post._id} className="group p-4 rounded-xl border bg-card hover:border-purple-300 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start gap-3">
                                   <div className="space-y-1">
                                      <h4 className="font-bold text-sm leading-tight text-foreground/90 group-hover:text-purple-700 transition-colors">{post.title}</h4>
                                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                                         <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Chưa xuất bản'}</span>
                                         <span>•</span>
                                         <span className={cn(
                                            post.status === 'published' ? 'text-green-600' : 'text-orange-500'
                                         )}>{post.status === 'published' ? 'Công khai' : 'Nháp'}</span>
                                      </div>
                                   </div>
                                   <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg group-hover:bg-purple-100">
                                      <Eye className="h-3 w-3" />
                                   </Button>
                                </div>
                             </div>
                          ))
                       ) : (
                          <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                             <FileText className="h-10 w-10 mx-auto opacity-10 mb-2" />
                             <p className="text-sm font-medium">Chưa có bài viết nào</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
