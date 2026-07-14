import mongoose, { Document } from "mongoose";
import { ProductType } from "../constants/product.constant";

export interface IProducts extends Document<string> {
  _id: string;
  productName: string;
  categoryIds: string[];
  isActive: boolean;
  price: number;
  unit: string;
  productType: ProductType;
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    productName: {
      type: String,
      required: true,
    },
    categoryIds: {
      type: [
        {
          type: String,
          ref: "Category",
        },
      ],
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      enum: Object.values(ProductType),
      required: true,
    },
    imageUrl: {
      type: String,
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
    collection: "z_products",
  },
);
export const Product = mongoose.model<IProducts>("Product", ProductSchema);
