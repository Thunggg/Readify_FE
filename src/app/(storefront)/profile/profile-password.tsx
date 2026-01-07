"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePassword() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>
          Cập nhật mật khẩu để bảo mật tài khoản
        </CardDescription>
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
            <Label htmlFor="confirmPassword">
              Xác nhận mật khẩu mới
            </Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline">Hủy</Button>
            <Button>Đổi mật khẩu</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


