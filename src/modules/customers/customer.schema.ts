import { z } from "zod";
import { CustomerType } from "../../constants/customer.constant";

export const createCustomerSchema = z.object({
  customerName: z
    .string()
    .min(3, "Name should contain minimum 3 letters")
    .max(40, "Name should not exceed 50 characters"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid Phone Number"),
  customerType: z.enum(CustomerType),
  address: z.string().trim().optional(),
  alternatePhoneNumber: z.string().optional(),
  specialNotes: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

