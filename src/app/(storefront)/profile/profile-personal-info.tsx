"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import dayjs from "dayjs";
import { useCurrentUser } from "@/contexts/user-context";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { EditProfileFormInput, editProfileFormSchema } from "@/validation/form-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AccountApiRequest } from "@/api-request/account";
import { handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";
import { ProfilePersonalInfoSkeleton } from "./skeletons/profile-personal-info-skeleton";

export default function ProfilePersonalInfo() {

  const { currentUser, loading } = useCurrentUser();
  const didInit = useRef(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditProfileFormInput>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      sex: 0,
      bio: "",
    },
  });

  useEffect(() => {
    // nếu không có currentUser, không reset form
    if (!currentUser) return;
    // nếu form đã bị thay đổi, không reset form
    if (isDirty) return;
    // nếu form đã được reset, không reset form
    if (didInit.current) return;

    reset({
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      phone: currentUser.phone ?? "",
      dateOfBirth: currentUser.dateOfBirth
        ? dayjs(currentUser.dateOfBirth).format("YYYY-MM-DD")
        : "",
      address: currentUser.address ?? "",
      sex: currentUser.sex ?? 0,
      bio: currentUser.bio ?? "",
    });
    didInit.current = true;
  }, [currentUser, reset, isDirty]);

  const onSubmit = useCallback<SubmitHandler<EditProfileFormInput>>(async (data) => {
    try {
      console.log("📦 API data:", data);
      const response = await AccountApiRequest.editProfile(data);
      if (response.status !== 200) {
        handleErrorApi({
          error: response.payload,
          setError: setError,
          duration: 5000,
        });
        return;
      }
      toast.success(response.payload.message, {
        style: {
          "--normal-bg":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-text": "var(--color-white)",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });
    } catch (error) {
      handleErrorApi({ error, setError: setError, duration: 5000 });
    }
  }, [setError]);

  if (loading) {
    return <ProfilePersonalInfoSkeleton />;
  }
  
  if (!currentUser) {
    return <div>Không thể tải thông tin người dùng</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>
            Cập nhật thông tin tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative h-24 w-24 rounded-full bg-muted overflow-hidden">
              <Image
                src="/diverse-user-avatars.png"
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                Thay đổi ảnh
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG. Tối đa 2MB
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Họ</Label>
              <Input
                {...register("firstName")}
                id="firstName"
                placeholder="Nhập họ"
              />
              {errors.firstName?.message && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Tên</Label>
              <Input
                {...register("lastName")}
                id="lastName"
                placeholder="Nhập tên"
              />
              {errors.lastName?.message && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="read-only:bg-muted dark:read-only:bg-gray-700 read-only:cursor-not-allowed"
                placeholder="you@example.com"
                readOnly
                value={currentUser.email ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                {...register("phone")}
                id="phone"
                type="tel"
                placeholder="090xxxxxxx"
              />
              {errors.phone?.message && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthday">Ngày sinh</Label>
              <Input {...register("dateOfBirth")} id="birthday" type="date" />
              {errors.dateOfBirth?.message && (
                <p className="text-sm text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Giới tính</Label>
              <Controller
                control={control}
                name="sex"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Không xác định</SelectItem>
                      <SelectItem value="1">Nam</SelectItem>
                      <SelectItem value="2">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Giới thiệu</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Viết vài dòng về bản thân..."
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {isSubmitting ? (
              <>
                <Spinner />
                <Button className="cursor-pointer" type="submit" disabled>
                  Đang lưu...
                </Button>
              </>
            ) : (
              <Button className="cursor-pointer" type="submit">
                Lưu thay đổi
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}


