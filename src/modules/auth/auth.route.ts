import { FastifyInstance } from "fastify";
import { getProfile, loginUser, register } from "./auth.controller";
import { protectedRoute } from "../../middleware/auth.middleware";
import { loginSchema, registerSchema } from "./auth.schema";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", { schema: { tags: ["Auth"], body: registerSchema } }, register);
  fastify.post("/login", { schema: { tags: ["Auth"], body: loginSchema } }, loginUser);
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
