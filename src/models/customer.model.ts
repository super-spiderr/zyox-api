import mongoose from "mongoose";
import { CustomerType } from "../constants/customer.constant";

export interface ICustomer extends Document {
  customerName: string;
  phoneNumber: string;
  email?: string;
  customerType: CustomerType;
  address?: string;
  alternatePhoneNumber?: string;
  specialNotes?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const CustomerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    customerType: {
      type: String,
      enum: [CustomerType.INDIVIDUAL, CustomerType.BUSINESS],
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    alternatePhoneNumber: {
      type: String,
      required: false,
    },
    specialNotes: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "z_customers",
  },
);
export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
