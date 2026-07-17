import { z } from "zod";
import {
  OrderStatus,
  PaymentStatus,
  OrderItemType,
  OrderSource,
} from "../../constants/order.constant";

export const orderItemSchema = z.object({
  type: z.enum(OrderItemType),
  itemId: z.string().min(1, "Item ID is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be at least 0"),
});

export const createOrderSchema = z
  .object({
    customerId: z.string().min(1).optional(),
    customerName: z.string().min(1).optional(),
    customerPhone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid Phone Number")
      .optional(),
    deliveryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Delivery date must be in YYYY-MM-DD format"),
    attributes: z.record(z.string(), z.unknown()).optional().default({}),
    orderSource: z.enum(OrderSource).optional(),
    orderItems: z.array(orderItemSchema).optional().default([]),
    discountAmount: z.number().min(0).optional().default(0),
    advanceAmount: z.number().min(0).optional().default(0),
    paymentStatus: z
      .enum(PaymentStatus)
      .optional()
      .default(PaymentStatus.PENDING),
    orderStatus: z.enum(OrderStatus).optional().default(OrderStatus.PENDING),
    completedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Completed date must be in YYYY-MM-DD format")
      .or(z.literal(""))
      .optional()
      .default(""),
    quotationUrl: z.string().optional().default(""),
    invoiceUrl: z.string().optional().default(""),
    notes: z.string().optional().default(""),
  })
  .refine((data) => data.customerId || (data.customerName && data.customerPhone), {
    message: "Either customerId, or customerName and customerPhone, is required",
    path: ["customerId"],
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z.object({
  customerId: z.string().min(1).optional(),
  deliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Delivery date must be in YYYY-MM-DD format")
    .optional(),
  attributes: z.record(z.string(), z.unknown()).optional(),
  orderSource: z.enum(OrderSource).optional(),
  orderItems: z.array(orderItemSchema).optional(),
  discountAmount: z.number().min(0).optional(),
  advanceAmount: z.number().min(0).optional(),
  paymentStatus: z.enum(PaymentStatus).optional(),
  orderStatus: z.enum(OrderStatus).optional(),
  completedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Completed date must be in YYYY-MM-DD format")
    .or(z.literal(""))
    .optional(),
  quotationUrl: z.string().optional(),
  invoiceUrl: z.string().optional(),
  notes: z.string().optional(),
});
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
