"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Upload, X } from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { StaffApiRequest } from "@/api-request/staff";
import { MediaApiRequest } from "@/api-request/media";
import { handleErrorApi } from "@/lib/utils";
import type { AdminAccount } from "@/types/account";
import {
  updateStaffFormSchema,
} from "@/validation/staff-form-schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EditStaffForm({ id }: { id: string }) {
  type EditStaffFormValues = z.input<typeof updateStaffFormSchema>;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const form = useForm<EditStaffFormValues>({
    resolver: zodResolver(updateStaffFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      email: "",
      password: "",
      role: 2,
      status: 1,
      sex: 1,
    },
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isDirty },
  } = form;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await StaffApiRequest.getStaffDetail(id);
        if (!res || !res.payload.success) {
          handleErrorApi({ error: res?.payload ?? { message: "Failed to load staff detail" } });
          return;
        }

        const data = res.payload.data;
        setAccount(data);
        setAvatarFile(null);
        setAvatarPreview(data.avatarUrl || null);

        form.reset(
          {
            email: data.email ?? "",
            password: "",
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            dateOfBirth: data.dateOfBirth
              ? dayjs(data.dateOfBirth).format("YYYY-MM-DD")
              : "",
            phone: data.phone ?? "",
            address: data.address ?? "",
            role: data.role ?? 2,
            status: data.status ?? 1,
            sex: data.sex ?? 1,
          },
          {
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
            keepIsSubmitted: false,
            keepSubmitCount: false,
          }
        );
      } catch (error) {
        handleErrorApi({ error });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, form]);

  async function onSubmit(formData: EditStaffFormValues) {
    if (!account?._id) return;

    setSubmitting(true);
    try {
      let avatarUrl = formData.avatarUrl;

      if (avatarFile) {
        setIsUploadingAvatar(true);
        try {
          const uploadRes = await MediaApiRequest.uploadAvatar(avatarFile);
          if (uploadRes?.payload?.success) {
            avatarUrl = uploadRes.payload.data.url;
          }
        } catch {
          toast.error("Failed to upload avatar");
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      const apiData: Record<string, unknown> = {};
      Object.entries({ ...formData, avatarUrl }).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          apiData[key] = value;
        }
      });

      const res = await StaffApiRequest.updateStaff(account._id, apiData);
      if (!res || !res.payload.success) {
        handleErrorApi({
          error: res?.payload ?? { message: "Failed to update staff account" },
          setError: form.setError,
          duration: 5000,
        });
        return;
      }

      setAccount(res.payload.data);
      toast.success(res.payload.message || "Update staff successfully");
      form.reset(
        {
          email: res.payload.data.email ?? "",
          password: "",
          firstName: res.payload.data.firstName ?? "",
          lastName: res.payload.data.lastName ?? "",
          dateOfBirth: res.payload.data.dateOfBirth
            ? dayjs(res.payload.data.dateOfBirth).format("YYYY-MM-DD")
            : "",
          phone: res.payload.data.phone ?? "",
          address: res.payload.data.address ?? "",
          role: res.payload.data.role ?? 2,
          status: res.payload.data.status ?? 1,
          sex: res.payload.data.sex ?? 1,
        },
        { keepDirty: false, keepErrors: false }
      );
      setAvatarFile(null);
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading staff detail...</div>;
  }

  if (!account?._id) {
    return <div className="text-sm text-destructive">Staff account not found.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Staff Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center gap-2 pb-3 border-b">
            <div className="relative group">
              <input
                id="ua-avatar"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAvatarPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
              <label htmlFor="ua-avatar" className="cursor-pointer block">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg transition-all group-hover:scale-105">
                  <AvatarImage src={avatarPreview || undefined} className="object-cover" />
                  <AvatarFallback className="bg-muted">
                    {account.firstName?.charAt(0)?.toUpperCase() || (
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-7 w-7 text-white" />
                </div>
              </label>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-medium">
                {avatarFile ? "New Avatar Selected" : "Change Avatar"}
              </p>
              <p className="text-xs text-muted-foreground">Click to upload (max 5MB)</p>
              {avatarFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setAvatarFile(null);
                    setAvatarPreview(account.avatarUrl || null);
                    const input = document.getElementById("ua-avatar") as HTMLInputElement;
                    if (input) input.value = "";
                  }}
                  className="text-destructive hover:text-destructive h-7"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ca-email" className="text-sm">Email</Label>
              <Input id="ca-email" {...register("email")} disabled className="bg-muted cursor-not-allowed" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ca-password" className="text-sm">Password (optional)</Label>
              <div className="relative">
                <Input
                  id="ca-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave blank to keep current"
                  {...register("password")}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password?.message && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ca-firstName" className="text-sm">First Name</Label>
              <Input id="ca-firstName" {...register("firstName")} />
              {errors.firstName?.message && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-lastName" className="text-sm">Last Name</Label>
              <Input id="ca-lastName" {...register("lastName")} />
              {errors.lastName?.message && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ca-dateOfBirth" className="text-sm">Date of Birth</Label>
              <Input id="ca-dateOfBirth" type="date" {...register("dateOfBirth")} />
              {errors.dateOfBirth?.message && (
                <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-sex" className="text-sm">Gender</Label>
              <Controller
                control={control}
                name="sex"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger id="ca-sex" className="cursor-pointer">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="2">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ca-phone" className="text-sm">Phone</Label>
              <Input id="ca-phone" {...register("phone")} />
              {errors.phone?.message && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-address" className="text-sm">Address</Label>
              <Input id="ca-address" {...register("address")} />
              {errors.address?.message && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ca-status" className="text-sm">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger id="ca-status" className="cursor-pointer">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                      <SelectItem value="-1">Banned</SelectItem>
                      <SelectItem value="2">Email not verified</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-role" className="text-sm">Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger id="ca-role" className="cursor-pointer">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">Seller</SelectItem>
                      <SelectItem value="3">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role?.message && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/staff/${id}`}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={submitting || isUploadingAvatar || (!isDirty && !avatarFile)}
            >
              {submitting || isUploadingAvatar ? "Updating..." : "Update Account"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
