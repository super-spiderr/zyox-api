import { FastifyInstance } from "fastify";
import { getProfile, loginUser, register, handleRefreshToken } from "./auth.controller";
import { protectedRoute } from "../../middleware/auth.middleware";
import { loginSchema, registerSchema, refreshSchema } from "./auth.schema";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", { schema: { tags: ["Auth"], body: registerSchema } }, register);
  fastify.post("/login", { schema: { tags: ["Auth"], body: loginSchema } }, loginUser);
  fastify.post("/refresh", { schema: { tags: ["Auth"], body: refreshSchema } }, handleRefreshToken);
  fastify.get(
    "/me",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
      },
    },
    getProfile,
  );
}

