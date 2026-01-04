import { z } from "zod";

const ROLE_VALUES = [0, 1, 2, 3] as const;

// Form schema: password can be empty string (meaning "do not change password")
export const updateAccountFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email can not be empty")
    .min(5, "Email must be at least 5 characters long")
    .max(255, "Email must be less than 255 characters long")
    .email("Invalid email format"),

  password: z.string(), // allow ""

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

export type UpdateAccountFormInput = z.infer<typeof updateAccountFormSchema>;
