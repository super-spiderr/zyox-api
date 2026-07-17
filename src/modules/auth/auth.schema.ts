import { z } from "zod";
import { VerticalType } from "../../constants/business.constant";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(3, "Name should contain at least 3 characters")
    .max(50, "Name should not exceed 50 characters"),
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password should be at least 8 characters"),
  businessName: z
    .string()
    .min(2, "Business name should contain at least 2 characters")
    .max(100, "Business name should not exceed 100 characters"),
  verticalType: z.string().optional().default(VerticalType.CATERING),
  language: z.string().optional().default("en"),
});

export const loginSchema = z.object({
  email: z.email("Invalid Email Format"),
  password: z.string().min(8, "Password should be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

