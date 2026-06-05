import mongoose, { Schema } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
}

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdBy: mongoose.Types.ObjectId;
  lastLoginAt?: Date;
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
  },
  { timestamps: true },
);
