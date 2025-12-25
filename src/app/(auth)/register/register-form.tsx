"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authApiRequest } from "@/api-request/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export const registerSchema = z.object({
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
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password must be less than 255 characters long")
})
.strict() // Không cho phép thêm các field không được khai báo trong schema
.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) { // Kiểm tra xem password và confirmPassword có khớp nhau không
    ctx.addIssue({
      code: z.ZodIssueCode.custom, // Code lỗi custom
      message: "Passwords do not match", // Message lỗi
      path: ["confirmPassword"], // Path lỗi
    })
  }
});

const RegisterForm = () => {
  const router = useRouter()

 const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      await authApiRequest.register(values.email, values.password, values.confirmPassword);

      toast.success('Register successful!', {
        style: {
          '--normal-bg': 'light-dark(var(--color-green-600), var(--color-green-400))',
          '--normal-text': 'var(--color-white)',
          '--normal-border': 'light-dark(var(--color-green-600), var(--color-green-400))'
        } as React.CSSProperties
      })
      router.push("/login")
    } catch (error) {
      toast.error((error as { payload: { message: string } }).payload.message, {
        style: {
          '--normal-bg': 'light-dark(var(--color-red-600), var(--color-red-400))',
          '--normal-text': 'var(--color-white)',
          '--normal-border': 'light-dark(var(--color-red-600), var(--color-red-400))'
        } as React.CSSProperties
      })
      console.error(error);
    }
  }

    return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
  
}

export default RegisterForm;