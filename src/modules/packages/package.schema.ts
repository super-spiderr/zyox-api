import { z } from "zod";
import { PackageType } from "../../constants/product.constant";

const packageItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
});

export const createPackageSchema = z.object({
  name: z
    .string()
    .min(3, "Name should contain minimum 3 letters")
    .max(50, "Name should not exceed 50 characters"),
  price: z.number().min(0, "Price should be greater than or equal to 0"),
  imageUrl: z.string().optional(),
  packageType: z.enum(PackageType, { message: "Invalid package type" }),
  items: z
    .array(packageItemSchema)
    .min(1, "At least one item is required in the package"),
  isActive: z.boolean().optional().default(true),
  createdBy: z.string().optional(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

export const updatePackageSchema = createPackageSchema.partial();
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
