import { z } from "zod";

export const createCategorySchema = z.object({
  categoryName: z
    .string()
    .min(3, "Name should contain minimum 3 letters")
    .max(40, "Name should not exceed 50 characters"),
  isActive: z.boolean().optional().default(true),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  createdBy: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
