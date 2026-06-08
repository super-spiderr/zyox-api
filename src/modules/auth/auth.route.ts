import { FastifyInstance } from "fastify";
import { getProfile, loginUser, register } from "./auth.controller";
import { protectedRoute } from "../../middleware/auth.middleware";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", register);
  fastify.post("/login", loginUser);
  fastify.get("/me", { preHandler: [protectedRoute] }, getProfile);
}
