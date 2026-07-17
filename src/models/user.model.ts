import mongoose, { Schema } from "mongoose";
import { UserRole } from "../constants/user.constant";

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: UserRole;
  businessId: mongoose.Types.ObjectId;
  isActive: boolean;
  mustChangePassword: boolean;
  createdBy: mongoose.Types.ObjectId;
  lastLoginAt?: Date;
  refreshToken?: string;
  updatedAt: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },

    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STAFF,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastLoginAt: {
      type: Date,
    },
    refreshToken: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "z_users",
  },
);

export const User = mongoose.model<IUser>("User", UserSchema);
