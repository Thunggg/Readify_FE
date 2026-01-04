 "use client";

import React, { useEffect, useState } from "react";
import { TriangleAlert, UserPlus } from "lucide-react";

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
import { z } from "zod";
import { AccountApiRequest } from "@/api-request/account";
import { toast } from "sonner"
import { handleErrorApi } from "@/lib/utils";

const ROLE_VALUES = [0, 1, 2, 3] as const;

export const createAccountSchema = z.object({
  email: z
    .string()
    .min(1, "Email can not be empty")
    .min(5, "Email must be at least 5 characters long")
    .max(255, "Email must be less than 255 characters long")
    .email("Invalid email format"),

  password: z
    .string()
    .min(1, "Password can not be empty")
    .min(6, "Password must be at least 6 characters long")
    .max(255, "Password must be less than 255 characters long"),

  firstName: z
    .string()
    .max(100, "First name must be less than 100 characters long")
    .min(1, "First name can not be empty"),

  lastName: z
    .string()
    .max(100, "Last name must be less than 100 characters long")
    .min(1, "Last name can not be empty"),

  dateOfBirth: z.string().min(1, "Date of birth can not be empty"),

  phone: z
    .string()
    .max(20, "Phone must be less than 20 characters long")
    .min(1, "Phone can not be empty"),

  address: z
    .string()
    .max(255, "Address must be less than 255 characters long")
    .min(1, "Address can not be empty"),

  role: z
    .number()
    .int("Role must be a number")
    .refine((val) => ROLE_VALUES.includes(val as any), {
      message: "Role must be one of 0,1,2,3",
    }),

  status: z.number().int("Status must be a number"),

  sex: z.number().int("Sex must be a number"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export default function CreateAccountModal({
  open,
  onOpenChange,
  onCreateAccount
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAccount: (data: AdminAccount) => void;
}) {
  const [error] = useState<string | null>(null);

  const form = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
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
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const { handleSubmit, register, control, formState: { errors } } = form;

  async function onSubmit(data: CreateAccountInput) {
    try {
      const res = await AccountApiRequest.createAccount(data);
      if (!res.payload.success) {
        handleErrorApi({ error: res.payload, setError: form.setError, duration: 5000 });
        return;
      }

      onCreateAccount(res.payload.data);
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
            Create account
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
            <Input
              id="ca-password"
              type="password"
              placeholder="••••••"
              {...register("password")}
            />
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
              <Input id="ca-firstName" placeholder="Son" {...register("firstName")} />
              {errors.firstName?.message && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ca-lastName">Last name</Label>
              <Input id="ca-lastName" placeholder="Admin" {...register("lastName")} />
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
              <Input id="ca-dateOfBirth" type="date" {...register("dateOfBirth")} />
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
                  <p className="text-sm text-destructive">{errors.sex.message}</p>
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
                  <p className="text-sm text-destructive">{errors.role.message}</p>
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
              <Input id="ca-phone" placeholder="0909999999" {...register("phone")} />
              {errors.phone?.message && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ca-address">Address</Label>
              <Input id="ca-address" placeholder="HCM" {...register("address")} />
              {errors.address?.message && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="submit" className="cursor-pointer">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


