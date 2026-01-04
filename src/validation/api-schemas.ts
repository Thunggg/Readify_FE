import { z } from "zod";

// API schema: password is either undefined OR a valid password (>= 6 chars)
export const updateAccountApiSchema = z.object({
  email: z.string().email("Invalid email format").min(5).max(255),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(255)
    .optional(),
  firstName: z.string().min(1, "First name can not be empty").max(100),
  lastName: z.string().min(1, "Last name can not be empty").max(100),
  dateOfBirth: z.string().min(1, "Date of birth can not be empty"),
  phone: z.string().min(1, "Phone can not be empty").max(20),
  address: z.string().min(1, "Address can not be empty").max(255),
  status: z.number().int("Status must be a number"),
  sex: z.number().int("Sex must be a number"),
});

export type UpdateAccountApiRequest = z.infer<typeof updateAccountApiSchema>;
