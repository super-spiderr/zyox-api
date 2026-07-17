import mongoose, { Document, Schema } from "mongoose";
import { OrderStatus, PaymentStatus, OrderItemType, OrderSource } from "../constants/order.constant";

export interface IOrderItem {
  type: OrderItemType;
  itemId: string;
  itemModel: "Product" | "Package";
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  businessId: mongoose.Types.ObjectId;
  customerId: string;
  deliveryDate: Date;
  attributes: Record<string, unknown>;
  orderSource?: OrderSource;
  orderItems: IOrderItem[];
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  completedAt?: string;
  quotationUrl: string;
  invoiceUrl: string;
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(OrderItemType),
      required: true,
    },
    itemId: {
      type: String,
      required: true,
      refPath: "orderItems.itemModel",
    },
    itemModel: {
      type: String,
      required: true,
      enum: ["Product", "Package"],
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "UnitPrice must be at least 0"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "TotalPrice must be at least 0"],
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    customerId: {
      type: String,
      ref: "Customer",
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
      index: true,
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    orderSource: {
      type: String,
      enum: Object.values(OrderSource),
      required: false,
    },
    orderItems: {
      type: [OrderItemSchema],
      default: [],
    },
    subTotal: {
      type: Number,
      required: true,
      min: [0, "SubTotal must be at least 0"],
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount must be at least 0"],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "TotalAmount must be at least 0"],
      default: 0,
    },
    advanceAmount: {
      type: Number,
      default: 0,
      min: [0, "Advance must be at least 0"],
    },
    balanceAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true,
    },
    completedAt: {
      type: String,
      default: "",
    },
    quotationUrl: {
      type: String,
      default: "",
    },
    invoiceUrl: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "z_orders",
  }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
