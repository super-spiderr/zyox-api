import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { UserRole } from "../constants/user.constant";
import { JwtPayload } from "../types/auth.types";

export const protectedRoute = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const authToken = request.headers.authorization;
    if (!authToken) {
      throw new Error("Token Missing");
    }
    const token = authToken.split(" ")[1];
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (typeof decoded === "string" || !decoded) {
      throw new Error("Invalid token payload");
    }

    request.user = {
      userId: decoded._id,
      role: decoded.role,
      businessId: decoded.businessId,
    };
  } catch {
    return reply.status(401).send({
      message: "Invalid token",
    });
  }
};

export const adminOnly = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (request?.user?.role !== UserRole.ADMIN) {
    return reply.status(403).send({
      message: "Forbidden",
    });
  }
};
