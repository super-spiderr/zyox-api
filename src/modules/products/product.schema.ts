import { z } from "zod";
import { ProductType } from "../../constants/product.constant";

export const createProductSchema = z.object({
  productName: z
    .string()
    .min(3, "Name should contain minimum 3 letters")
    .max(40, "Name should not exceed 40 characters"),
  categoryIds: z
    .array(z.string().min(1, "Category ID cannot be empty"))
    .min(1, "Category is required"),
  price: z.number().min(0, "Price should be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  productType: z.enum(ProductType, { message: "Invalid product type" }),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  createdBy: z.string().optional(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;
export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
