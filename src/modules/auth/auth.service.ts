import bcrypt from "bcrypt";
import { User } from "../../models/user.model";
import { Business } from "../../models/business.model";
import jwt from "jsonwebtoken";
import { UserRole } from "../../constants/user.constant";
import { JwtPayload } from "../../types/auth.types";

export const registerAdmin = async (
  firstName: string,
  email: string,
  password: string,
  businessName: string,
  verticalType: string,
  language: string,
) => {
  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    throw new Error("Admin already exists");
  }

  const business = await Business.create({
    name: businessName,
    verticalType,
    language,
  });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    email,
    password: hashedPassword,
    role: UserRole.ADMIN,
    businessId: business._id,
    isActive: true,
    mustChangePassword: false,
  });

  business.ownerId = user._id as typeof business.ownerId;
  await business.save();

  return user;
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({
    email,
    isActive: true,
  });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const payload = {
        _id: user._id.toString(),
        role: user.role,
        businessId: user.businessId.toString(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
        expiresIn: "24h",
      });
      const refreshSecret = process.env.JWT_REFRESH_SECRET_KEY as string;
      const refreshToken = jwt.sign(payload, refreshSecret, {
        expiresIn: "7d",
      });
      user.refreshToken = refreshToken;
      user.lastLoginAt = new Date();
      await user.save();
      return {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessId: user.businessId,
        },
        token,
        refreshToken,
      };
    } else {
      throw new Error("Invalid email or password");
    }
  } else {
    throw new Error("Invalid email or password");
  }
};

export const getUserById = async (id: string) => {
  const user = await User.findById(id).select("-password -mustChangePassword");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const refreshTokens = async (refreshToken: string) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET_KEY as string;

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(refreshToken, refreshSecret) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token", { cause: error });
  }

  if (!decoded || typeof decoded === "string" || !decoded._id) {
    throw new Error("Invalid refresh token payload");
  }

  const user = await User.findOne({ _id: decoded._id, isActive: true });
  if (user?.refreshToken !== refreshToken) {
    throw new Error("Invalid or expired refresh token");
  }

  const payload = {
    _id: user._id.toString(),
    role: user.role,
    businessId: user.businessId.toString(),
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
    expiresIn: "24h",
  });

  const newRefreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: "7d",
  });

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    token,
    refreshToken: newRefreshToken,
  };
};
