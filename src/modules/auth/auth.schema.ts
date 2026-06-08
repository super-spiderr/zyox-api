import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(3, "Name should contain at least 3 characters")
    .max(50, "Name should not exceed 50 characters"),
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password should be at least 8 characters"),
});
export const loginSchema = z.object({
  email: z.email("Invalid Email Format"),
  password: z.string().min(8, "Password should be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
