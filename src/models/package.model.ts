import mongoose, { Schema, Document } from "mongoose";
import { PackageType } from "../constants/product.constant";

export interface IPackageItem {
  itemId: string;
  qty: number;
}

export interface IPackage extends Document<string> {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  packageType: PackageType;
  isActive: boolean;
  items: IPackageItem[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PackageItemSchema = new Schema(
  {
    itemId: {
      type: String,
      ref: "Product",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false }
);

const PackageSchema = new Schema<IPackage>(
  {
    _id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be at least 0"],
    },
    imageUrl: {
      type: String,
      required: false,
    },
    packageType: {
      type: String,
      enum: Object.values(PackageType),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    items: {
      type: [PackageItemSchema],
      required: true,
      validate: {
        validator: function (v: any[]) {
          return v && v.length > 0;
        },
        message: "A package must contain at least one item",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "z_packages",
  }
);

export const Package = mongoose.model<IPackage>("Package", PackageSchema);
