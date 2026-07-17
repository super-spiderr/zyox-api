import mongoose, { Document, Schema } from "mongoose";
import { DEFAULT_VERTICAL_TYPE } from "../constants/business.constant";

export interface IBusiness extends Document {
  name: string;
  verticalType: string;
  language: string;
  ownerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    verticalType: {
      type: String,
      required: true,
      default: DEFAULT_VERTICAL_TYPE,
      trim: true,
      uppercase: true,
    },
    language: {
      type: String,
      required: true,
      default: "en",
      trim: true,
      lowercase: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "z_businesses",
  },
);

export const Business = mongoose.model<IBusiness>("Business", BusinessSchema);
