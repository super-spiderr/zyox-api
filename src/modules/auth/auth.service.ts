import bcrypt from "bcrypt";
import { User } from "../../models/user.model";
import jwt from "jsonwebtoken";
import { UserRole } from "../../constants/user.constant";

export const registerAdmin = async (
  firstName: string,
  email: string,
  password: string,
) => {
  const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
  if (existingAdmin) {
    throw new Error("Admin already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    email,
    password: hashedPassword,
    role: UserRole.ADMIN,
    isActive: true,
    mustChangePassword: false,
  });

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
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
        expiresIn: "24h",
      });
      user.lastLoginAt = new Date();
      await user.save();
      return {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
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
