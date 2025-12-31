"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import AuthBackgroundShape from "@/assets/svg/auth-background-shape"
import { authApiRequest } from "@/api-request/auth"
import Logo from "@/components/shadcn-studio/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { handleErrorApi } from "@/lib/utils"
import { EyeIcon, EyeOffIcon } from "lucide-react"

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(5, "Email must be at least 5 characters long")
      .max(255, "Email must be less than 255 characters long")
      .email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(255, "Password must be less than 255 characters long"),
  })
  .strict();

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false)

  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await authApiRequest.login(
        values.email,
        values.password
      );

      const accessToken = response.payload.data.accessToken;

      // Decode JWT token để lấy role (không cần verify vì đã tin backend)
      const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
      const role = tokenPayload.role;

      toast.success("Login successful!", {
        style: {
          "--normal-bg":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-text": "var(--color-white)",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });

      // Redirect dựa vào role
      if (role === 3) {
        router.push("/warehousestaff/income");
      } else if (role === 2) {
        router.push("/seller");
      } else if (role === 1) {
        router.push("/admin");
      } else {
        router.push("/me");
      }
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute">
        <AuthBackgroundShape />
      </div>

      <Card className="z-[1] w-full border-none shadow-md sm:max-w-lg">
        <CardHeader className="gap-6">
          <Logo className="gap-3" />

          <div>
            <CardTitle className="mb-1.5 text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-base text-center">Welcome back. Please sign in to continue.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel htmlFor="email" className="leading-5">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input id="email" type="email" placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="w-full space-y-1">
                      <FormLabel htmlFor="password" className="leading-5">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            type={isVisible ? "text" : "password"}
                            placeholder="••••••••••••••••"
                            className="pr-9"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsVisible((prev) => !prev)}
                            className="cursor-pointer text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                          >
                            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                            <span className="sr-only">{isVisible ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remember Me and Forgot Password */}
                <div className="flex items-center justify-between gap-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox id="rememberMe" className="size-6 cursor-pointer" />
                    <label htmlFor="rememberMe" className="text-muted-foreground text-sm">
                      Remember Me
                    </label>
                  </div>

                  <a href="#" className="text-sm hover:underline">
                    Forgot Password?
                  </a>
                </div>

                <Button className="w-full cursor-pointer" type="submit" disabled={isLoading}>
                  Login
                </Button>
              </form>
            </Form>

            <p className="text-muted-foreground text-center">
              Dont have an account?{" "}
              <Link href="/register" className="text-card-foreground hover:underline">
                Sign up
              </Link>
            </p>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <p>or</p>
              <Separator className="flex-1" />
            </div>

            <Button variant="ghost" className="w-full" asChild type="button">
              <a href="#">Sign in with google</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
