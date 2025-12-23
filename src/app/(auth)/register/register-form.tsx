"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import envConfig from "@/configs/config-env"

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
      const response = await fetch(`${envConfig?.NEXT_PUBLIC_API_ENDPOINT ?? ""}/accounts/register`, {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(response => response.json());
      console.log(response);
    } catch (error) {
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