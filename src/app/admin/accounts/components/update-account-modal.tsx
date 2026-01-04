 "use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, TriangleAlert, UserPlus } from "lucide-react";

import type { AdminAccount } from "@/types/account";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { AccountApiRequest } from "@/api-request/account";
import { toast } from "sonner"
import { handleErrorApi } from "@/lib/utils";
import dayjs from "dayjs";

import type { UpdateAccountApiRequest } from "@/validation/api-schemas";
import { updateAccountFormSchema, type UpdateAccountFormInput } from "@/validation/form-schemas";

function transformFormToApi(formData: UpdateAccountFormInput): UpdateAccountApiRequest {
  const { role, ...rest } = formData;
  void role;

  return {
    ...rest,
    password:
      formData.password && formData.password.length >= 6
        ? formData.password
        : undefined,
  };
}

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

  const form = useForm<UpdateAccountFormInput>({
    resolver: zodResolver(updateAccountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      email: "",
      password: "",
      role: 0,
      status: 1,
      sex: 1,
    },
  });

    useEffect(() => {
    if (!open) return;

    if(selectedAccount) {
      form.setValue("password", "");
      form.setValue("email", selectedAccount.email);
      form.setValue("firstName", selectedAccount.firstName || "");
      form.setValue("lastName", selectedAccount.lastName || "");
      form.setValue("dateOfBirth", selectedAccount.dateOfBirth
        ? dayjs(selectedAccount.dateOfBirth).format("YYYY-MM-DD")
        : "");
      form.setValue("phone", selectedAccount.phone || "");
      form.setValue("address", selectedAccount.address || "");
      form.setValue("role", selectedAccount.role || 0);
      form.setValue("status", selectedAccount.status || 1);
      form.setValue("sex", selectedAccount.sex || 1);
    } else{
        form.reset();
    }
  }, [open, form, selectedAccount]);

  const { handleSubmit, register, control, formState: { errors } } = form;

  async function onSubmit(formData: UpdateAccountFormInput) {
    try {
      if (!selectedAccount?._id) return;

      const apiData = transformFormToApi(formData);
      const res = await AccountApiRequest.updateAccount(selectedAccount._id, apiData);
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Update account
          </DialogTitle>
          <DialogDescription>Fill the form.</DialogDescription>
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

        {/* form wrapper */}
        <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            {/* ID (hidden) */}
          <div className="grid gap-2">
            <Label htmlFor="ca-email">ID</Label>
            <Input disabled value={selectedAccount?._id} id="ca-id"/>
          </div>

          {/* Email (full width) */}
          <div className="grid gap-2">
            <Label htmlFor="ca-email">Email</Label>
            <Input
              id="ca-email"
              placeholder="seller1000@0gmail.com"
              {...register("email")}
            />
            {errors.email?.message && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password (full width) */}
          <div className="grid gap-2">
            <Label htmlFor="ca-password">Password</Label>
            <div className="relative">
              <Input
                id="ca-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                {...register("password")}
                className="pr-10"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-transparent"
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
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ca-firstName">First name</Label>
              <Input
                id="ca-firstName"
                placeholder="Son"
                {...register("firstName")}
              />
              {errors.firstName?.message && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ca-lastName">Last name</Label>
              <Input
                id="ca-lastName"
                placeholder="Admin"
                {...register("lastName")}
              />
              {errors.lastName?.message && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Identity: Date of birth (50%) + Sex/Role/Status (50%) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ca-dateOfBirth">Date of birth</Label>
              <Input
                id="ca-dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
              {errors.dateOfBirth?.message && (
                <p className="text-sm text-destructive">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="ca-sex">Sex</Label>
                <Controller
                  control={control}
                  name="sex"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger id="ca-sex" className="cursor-pointer">
                        <SelectValue placeholder="Sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Male</SelectItem>
                        <SelectItem value="2">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sex?.message && (
                  <p className="text-sm text-destructive">
                    {errors.sex.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ca-role">Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger id="ca-role" className="cursor-pointer">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">User</SelectItem>
                        <SelectItem value="1">Admin</SelectItem>
                        <SelectItem value="2">Seller</SelectItem>
                        <SelectItem value="3">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role?.message && (
                  <p className="text-sm text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ca-status">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger id="ca-status" className="cursor-pointer">
                        <SelectValue placeholder="Status" />
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
                  <p className="text-sm text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Phone (50%) + Address (50%) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ca-phone">Phone</Label>
              <Input
                id="ca-phone"
                placeholder="0909999999"
                {...register("phone")}
              />
              {errors.phone?.message && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ca-address">Address</Label>
              <Input
                id="ca-address"
                placeholder="HCM"
                {...register("address")}
              />
              {errors.address?.message && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="submit" className="cursor-pointer">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


