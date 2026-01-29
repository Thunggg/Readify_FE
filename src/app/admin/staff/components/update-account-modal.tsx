 "use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, TriangleAlert, UserPlus, Upload, X } from "lucide-react";

import type { AdminAccount } from "@/types/account";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"
import { handleErrorApi } from "@/lib/utils";
import dayjs from "dayjs";
import { StaffApiRequest } from "@/api-request/staff";
import { updateStaffFormSchema, type UpdateStaffFormInput } from "@/validation/staff-form-schemas";
import { MediaApiRequest } from "@/api-request/media";

export default function UpdateAccountModal({
  open,
  onOpenChange,
  selectedAccount,
  onUpdateAccount
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAccount: AdminAccount | null;
  onUpdateAccount: (data: AdminAccount) => void;
}) {
  const [error] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const form = useForm<UpdateStaffFormInput>({
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

  useEffect(() => {
    if (!open) return;

    setAvatarFile(null);
    setAvatarPreview(selectedAccount?.avatarUrl || null);

    if (selectedAccount) {
      form.reset(
        {
          email: selectedAccount.email ?? "",
          password: "",
          firstName: selectedAccount.firstName ?? "",
          lastName: selectedAccount.lastName ?? "",
          dateOfBirth: selectedAccount.dateOfBirth
            ? dayjs(selectedAccount.dateOfBirth).format("YYYY-MM-DD")
            : "",
          phone: selectedAccount.phone ?? "",
          address: selectedAccount.address ?? "",
          role: selectedAccount.role ?? 0,
          status: selectedAccount.status ?? 1,
          sex: selectedAccount.sex ?? 1,
        },
        {
          keepErrors: false,
          keepDirty: false,
          keepTouched: false,
          keepIsSubmitted: false,
          keepSubmitCount: false,
        }
      );
    } else {
      form.reset(undefined, { keepErrors: false });
    }
  }, [open, selectedAccount, form]);

  const { handleSubmit, register, control, formState: { errors, isDirty } } = form;

  async function onSubmit(formData: UpdateStaffFormInput) {
    try {
      if (!selectedAccount?._id) return;

      let avatarUrl = formData.avatarUrl;

      // Upload avatar nếu có file mới
      if (avatarFile) {
        setIsUploadingAvatar(true);
        try {
          const uploadRes = await MediaApiRequest.uploadAvatar(avatarFile);
          if (uploadRes?.payload?.success) {
            avatarUrl = uploadRes.payload.data.url;
          }
        } catch (uploadError) {
          toast.error("Failed to upload avatar");
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Clean up empty values
      const apiData: any = {};
      Object.entries({ ...formData, avatarUrl }).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          apiData[key] = value;
        }
      });

      const res = await StaffApiRequest.updateStaff(selectedAccount._id, apiData);
      if (!res.payload.success) {
        handleErrorApi({ error: res.payload, setError: form.setError, duration: 5000 });
        return;
      }

      onUpdateAccount(res.payload.data);
      toast.success(res.payload.message, {
        style: {
          "--normal-bg":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-text": "var(--color-white)",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });
      onOpenChange(false);
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, duration: 5000 });
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Update Staff Account
          </DialogTitle>
          <DialogDescription>
            Update account information. Leave password blank to keep current.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="bg-destructive/10 text-destructive border-none">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Invalid input</AlertTitle>
            <AlertDescription className="text-destructive/80">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Avatar Upload */}
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
              <label
                htmlFor="ua-avatar"
                className="cursor-pointer block"
              >
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg transition-all group-hover:scale-105">
                  <AvatarImage src={avatarPreview || undefined} className="object-cover" />
                  <AvatarFallback className="bg-muted">
                    {selectedAccount?.firstName?.charAt(0)?.toUpperCase() || (
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
              <p className="text-xs text-muted-foreground">
                Click to upload (max 5MB)
              </p>
              {avatarFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setAvatarFile(null);
                    setAvatarPreview(selectedAccount?.avatarUrl || null);
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

          {/* Account Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Account Credentials</h3>
            <div className="space-y-1.5">
              <Label htmlFor="ca-email" className="text-sm">Email</Label>
              <Input
                id="ca-email"
                placeholder="seller@example.com"
                {...register("email")}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ca-password" className="text-sm">
                Password{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              </Label>
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password?.message && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Uppercase, lowercase, number & special char
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Personal Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ca-firstName" className="text-sm">First Name</Label>
                <Input
                  id="ca-firstName"
                  placeholder="John"
                  {...register("firstName")}
                />
                {errors.firstName?.message && (
                  <p className="text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ca-lastName" className="text-sm">Last Name</Label>
                <Input
                  id="ca-lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                />
                {errors.lastName?.message && (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ca-dateOfBirth" className="text-sm">Date of Birth</Label>
                <Input
                  id="ca-dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                />
                {errors.dateOfBirth?.message && (
                  <p className="text-xs text-destructive">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ca-sex" className="text-sm">Gender</Label>
                <Controller
                  control={control}
                  name="sex"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
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
                {errors.sex?.message && (
                  <p className="text-xs text-destructive">
                    {errors.sex.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Contact Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ca-phone" className="text-sm">Phone Number</Label>
                <Input
                  id="ca-phone"
                  placeholder="0909999999"
                  {...register("phone")}
                />
                {errors.phone?.message && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ca-address" className="text-sm">Address</Label>
                <Input
                  id="ca-address"
                  placeholder="123 Main St"
                  {...register("address")}
                />
                {errors.address?.message && (
                  <p className="text-xs text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Status & Role */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Role & Status</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ca-status" className="text-sm">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
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
                {errors.status?.message && (
                  <p className="text-xs text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ca-role" className="text-sm">Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
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
                {errors.role?.message && (
                  <p className="text-xs text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="cursor-pointer" 
              disabled={isUploadingAvatar || (!isDirty && !avatarFile)}
            >
              {isUploadingAvatar ? "Uploading..." : "Update Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


