import { z } from "zod";
import { OrderStatus, PaymentStatus, OrderItemType } from "../../constants/order.constant";

export const orderItemSchema = z.object({
  type: z.nativeEnum(OrderItemType),
  itemId: z.string().min(1, "Item ID is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be at least 0"),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  eventName: z.string().min(1, "Event name is required"),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Event date must be in YYYY-MM-DD format"),
  guestCount: z.number().int().min(1, "Guest count must be at least 1"),
  orderItems: z.array(orderItemSchema).min(1, "At least one order item is required"),
  discountAmount: z.number().min(0).optional().default(0),
  advanceAmount: z.number().min(0).optional().default(0),
  paymentStatus: z.nativeEnum(PaymentStatus).optional().default(PaymentStatus.PENDING),
  orderStatus: z.nativeEnum(OrderStatus).optional().default(OrderStatus.PENDING),
  completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Completed date must be in YYYY-MM-DD format").or(z.literal("")).optional().default(""),
  quotationUrl: z.string().optional().default(""),
  invoiceUrl: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = createOrderSchema.partial();
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
