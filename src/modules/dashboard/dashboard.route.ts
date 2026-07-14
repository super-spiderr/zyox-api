import { FastifyInstance } from "fastify";
import { protectedRoute } from "../../middleware/auth.middleware";
import { getDashboardController } from "./dashboard.controller";
import { dashboardQuerySchema } from "./dashboard.schema";

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Dashboard"],
        security: [{ bearerAuth: [] }],
        querystring: dashboardQuerySchema,
      },
    },
    getDashboardController
  );
}
