import { FastifyRequest, FastifyReply } from "fastify";
import { loginSchema, registerSchema } from "./auth.schema";
import { getUserById, login, registerAdmin } from "./auth.service";

export const register = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const body = registerSchema.parse(request.body);
    const user = await registerAdmin(body.firstName, body.email, body.password);
    return reply.status(201).send({
      success: true,
      message: "Admin registered successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const loginUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const body = loginSchema.parse(request.body);
    const result = await login(body.email, body.password);
    return reply.status(200).send({
      success: true,
      message: "User logged in successfully",
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getProfile = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = request.user;
  if (user) {
    const result = await getUserById(user?.userId);
    return reply.status(200).send({
      success: true,
      message: "Profile fetched successfully",
      data: result,
    });
  } else {
    return reply.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }
};
