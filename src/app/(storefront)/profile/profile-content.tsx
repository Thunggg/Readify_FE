"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Package, MapPin, Lock, Edit2, Trash2, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState("info")

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Tài khoản của tôi</h1>
          <p className="text-muted-foreground mt-2">Quản lý thông tin cá nhân và đơn hàng của bạn</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="info" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Thông tin</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Đơn hàng</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Địa chỉ</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Mật khẩu</span>
            </TabsTrigger>
          </TabsList>

          {/* Thông tin cá nhân */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative h-24 w-24 rounded-full bg-muted overflow-hidden">
                    <Image src="/diverse-user-avatars.png" alt="Avatar" fill className="object-cover" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Thay đổi ảnh
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG. Tối đa 2MB</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input id="fullName" defaultValue="Nguyễn Văn A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="user@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" type="tel" defaultValue="0912345678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthday">Ngày sinh</Label>
                    <Input id="birthday" type="date" defaultValue="1990-01-01" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Giới thiệu</Label>
                    <Textarea id="bio" placeholder="Viết vài dòng về bản thân..." className="resize-none" rows={3} />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Hủy</Button>
                  <Button>Lưu thay đổi</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Đơn hàng */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng của tôi</CardTitle>
                <CardDescription>Xem và theo dõi tình trạng đơn hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order 1 */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Đơn hàng #DH001234</p>
                        <p className="text-sm text-muted-foreground">Ngày đặt: 15/01/2025</p>
                      </div>
                      <Badge className="bg-green-500">Đã giao</Badge>
                    </div>
                    <div className="flex gap-4">
                      <div className="relative h-20 w-16 flex-shrink-0 rounded overflow-hidden">
                        <Image src="/alchemist-book-cover.png" alt="Nhà Giả Kim" fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Nhà Giả Kim</p>
                        <p className="text-sm text-muted-foreground">Số lượng: 1</p>
                        <p className="text-sm font-semibold mt-1">120.000đ</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="font-semibold">Tổng cộng: 120.000đ</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/book/1">Mua lại</Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order 2 */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Đơn hàng #DH001235</p>
                        <p className="text-sm text-muted-foreground">Ngày đặt: 20/01/2025</p>
                      </div>
                      <Badge className="bg-blue-500">Đang giao</Badge>
                    </div>
                    <div className="flex gap-4">
                      <div className="relative h-20 w-16 flex-shrink-0 rounded overflow-hidden">
                        <Image src="/atomic-habits-book.png" alt="Atomic Habits" fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Atomic Habits</p>
                        <p className="text-sm text-muted-foreground">Số lượng: 2</p>
                        <p className="text-sm font-semibold mt-1">320.000đ</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="font-semibold">Tổng cộng: 320.000đ</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Theo dõi
                        </Button>
                        <Button variant="outline" size="sm">
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order 3 */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Đơn hàng #DH001236</p>
                        <p className="text-sm text-muted-foreground">Ngày đặt: 25/01/2025</p>
                      </div>
                      <Badge className="bg-yellow-500">Đang xử lý</Badge>
                    </div>
                    <div className="flex gap-4">
                      <div className="relative h-20 w-16 flex-shrink-0 rounded overflow-hidden">
                        <Image src="/sapiens-book-cover.png" alt="Sapiens" fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Sapiens: Lược Sử Loài Người</p>
                        <p className="text-sm text-muted-foreground">Số lượng: 1</p>
                        <p className="text-sm font-semibold mt-1">189.000đ</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="font-semibold">Tổng cộng: 189.000đ</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                          Hủy đơn
                        </Button>
                        <Button variant="outline" size="sm">
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Địa chỉ */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Địa chỉ giao hàng</CardTitle>
                    <CardDescription>Quản lý địa chỉ nhận hàng của bạn</CardDescription>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm địa chỉ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Address 1 - Default */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">Nhà riêng</p>
                          <Badge variant="secondary" className="text-xs">
                            Mặc định
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">Nguyễn Văn A</p>
                        <p className="text-sm text-muted-foreground">0912345678</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                    </p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Đặt làm mặc định
                    </Button>
                  </div>

                  {/* Address 2 */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">Văn phòng</p>
                        <p className="text-sm font-medium">Nguyễn Văn A</p>
                        <p className="text-sm text-muted-foreground">0912345678</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                    </p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Đặt làm mặc định
                    </Button>
                  </div>

                  {/* Address 3 */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">Nhà bố mẹ</p>
                        <p className="text-sm font-medium">Nguyễn Thị B</p>
                        <p className="text-sm text-muted-foreground">0987654321</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      789 Đường Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                    </p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Đặt làm mặc định
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Đổi mật khẩu */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input id="newPassword" type="password" />
                    <p className="text-xs text-muted-foreground">
                      Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Hủy</Button>
                    <Button>Đổi mật khẩu</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
