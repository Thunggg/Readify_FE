"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { CategoryApiRequest, type Category } from "@/api-request/category";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FolderTree,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Folder,
  Book,
  MoreVertical,
  ChevronRight,
  ChevronDown,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]); // For parent selection
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await CategoryApiRequest.getCategories({ limit: 100 });
      if (res?.payload?.success) {
        setCategories(res.payload.data.items);
        setAllCategories(res.payload.data.items);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = () => {
    setEditingCategory({
      name: "",
      slug: "",
      description: "",
      parentId: null,
      status: 1,
      sortOrder: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingCategory?.name) {
      toast.warning("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      if (editingCategory._id) {
        await CategoryApiRequest.updateCategory(editingCategory._id, editingCategory);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await CategoryApiRequest.createCategory(editingCategory);
        toast.success("Tạo danh mục thành công");
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu danh mục");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await CategoryApiRequest.deleteCategory(id);
      toast.success("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      toast.error("Xóa danh mục thất bại");
    }
  };

  // Helper to build hierarchy
  const buildHierarchy = (items: Category[], parentId: string | null = null, level = 0): any[] => {
    return items
      .filter(item => {
        if (parentId === null) {
          return !item.parentId; // Matches null, undefined, "", or 0
        }
        return String(item.parentId) === String(parentId);
      })
      .map(item => ({
        ...item,
        level,
        children: buildHierarchy(items, item._id, level + 1)
      }));
  };

  const flatHierarchy = (items: any[]): any[] => {
    let result: any[] = [];
    items.forEach(item => {
      const { children, ...rest } = item;
      result.push(rest);
      if (children && children.length > 0) {
        result = [...result, ...flatHierarchy(children)];
      }
    });
    return result;
  };

  const rootItems = buildHierarchy(categories);
  const flatTree = flatHierarchy(rootItems);
  
  // If we have categories but hierarchy resulted in 0 items (e.g. no root categories), 
  // fall back to a flat mapping for safety.
  const displayItems = flatTree.length > 0 || categories.length === 0 ? flatTree : categories.map(c => ({...c, level: 0}));

  const filteredCategories = displayItems.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FolderTree className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Danh mục</h1>
            <p className="text-muted-foreground">
              Tổ chức phân cấp sản phẩm và quản lý thông tin danh mục
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={fetchCategories} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Làm mới
          </Button>
          <Button size="sm" onClick={handleCreate} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Thêm danh mục mới
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
                className="pl-9 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b">
                <TableHead className="py-4 pl-6">Danh mục</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Sách</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Số thứ tự</TableHead>
                <TableHead className="text-right pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-16 text-center text-muted-foreground animate-pulse">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-muted-foreground opacity-60">
                    <div className="flex flex-col items-center gap-3">
                      <FolderTree className="h-12 w-12 opacity-20" />
                      <p className="font-medium">Không tìm thấy danh mục nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((c: any) => (
                  <TableRow key={c._id} className="group hover:bg-primary/5 transition-colors border-b">
                    <TableCell className={cn("py-4 font-medium", c.level > 0 && "pl-6")}>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: c.level }).map((_, i) => (
                           <div key={i} className="w-8 border-r border-dashed h-10 -mt-5 -ml-4" />
                        ))}
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          c.level === 0 ? "bg-primary/20 text-primary shadow-sm" : "bg-muted text-muted-foreground"
                        )}>
                          {c.level === 0 ? <Folder className="h-4 w-4 fill-primary/30" /> : <ChevronRight className="h-3 w-3" />}
                        </div>
                        <span className={cn(
                          "transition-all",
                          c.level === 0 ? "text-base font-bold" : "text-sm text-muted-foreground"
                        )}>
                          {c.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground/80">{c.slug}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border-none px-2 font-bold flex items-center gap-1.5 w-fit mx-auto">
                        <Book className="h-3 w-3" />
                        {c.bookCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === 1 ? "default" : "secondary"} className={cn(
                        "rounded-full px-3",
                        c.status === 1 ? "bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm shadow-emerald-500/20" : ""
                      )}>
                         {c.status === 1 ? "Hoạt động" : "Tạm ngưng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <span className="text-sm font-medium opacity-60">#{c.sortOrder}</span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(c)}>
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

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] shadow-2xl border-none p-0 overflow-hidden rounded-2xl">
          <div className="bg-primary/5 p-6 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingCategory?._id ? "Cập nhật danh mục" : "Tạo danh mục mới"}</DialogTitle>
              <DialogDescription className="text-muted-foreground/80">
                Lưu ý: Slug sẽ được tự động tạo nếu để trống
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider opacity-60">Tên danh mục</Label>
              <Input 
                id="name" 
                className="h-11 bg-muted/30 focus:bg-background transition-all"
                value={editingCategory?.name} 
                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                placeholder="VD: Văn học Việt Nam"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug" className="text-sm font-bold uppercase tracking-wider opacity-60">Slug (Tùy chọn)</Label>
              <Input 
                 id="slug"
                 className="h-11 bg-muted/30 focus:bg-background transition-all font-mono text-sm"
                 value={editingCategory?.slug} 
                 onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                 placeholder="VD: van-hoc-viet-nam"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent" className="text-sm font-bold uppercase tracking-wider opacity-60">Danh mục cha</Label>
              <Select 
                value={editingCategory?.parentId || "root"} 
                onValueChange={(val) => setEditingCategory({...editingCategory, parentId: val === "root" ? null : val})}
              >
                <SelectTrigger className="h-11 bg-muted/30">
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Không có (Danh mục gốc)</SelectItem>
                  {allCategories
                    .filter(c => c._id !== editingCategory?._id) // Avoid self-parenting
                    .map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider opacity-60">Số thứ tự</Label>
                <Input 
                  type="number"
                  className="h-11 bg-muted/30"
                  value={editingCategory?.sortOrder}
                  onChange={(e) => setEditingCategory({...editingCategory, sortOrder: Number(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                 <Label className="text-sm font-bold uppercase tracking-wider opacity-60">Trạng thái</Label>
                  <Select 
                    value={String(editingCategory?.status)} 
                    onValueChange={(val) => setEditingCategory({...editingCategory, status: Number(val)})}
                  >
                    <SelectTrigger className="h-11 bg-muted/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Hoạt động</SelectItem>
                      <SelectItem value="0">Tạm ngưng</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 bg-muted/5">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 px-6 font-medium">Hủy</Button>
            <Button onClick={handleSave} className="rounded-xl bg-primary hover:bg-primary/90 h-11 px-8 font-bold shadow-lg shadow-primary/20">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
