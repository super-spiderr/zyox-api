import mongoose, { Document } from "mongoose";

export interface ICategory extends Document<string> {
  _id: string;
  categoryName: string;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    categoryName: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    description: {
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
    collection: "z_categories",
  },
);
export const Category = mongoose.model<ICategory>("Category", CategorySchema);
