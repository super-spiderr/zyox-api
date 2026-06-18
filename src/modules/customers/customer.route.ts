import { FastifyInstance } from "fastify";
import { protectedRoute } from "../../middleware/auth.middleware";
import {
  createCustomerController,
  deleteCustomerController,
  getCustomerByIdController,
  getCustomersController,
  updateCustomerController,
} from "./customer.controller";

export default async function customerRoutes(fastify: FastifyInstance) {
  fastify.post("/", { preHandler: [protectedRoute] }, createCustomerController);
  fastify.get("/", { preHandler: [protectedRoute] }, getCustomersController);
  fastify.get(
    "/:id",
    { preHandler: [protectedRoute] },
    getCustomerByIdController,
  );
  fastify.put(
    "/:id",
    { preHandler: [protectedRoute] },
    updateCustomerController,
  );
  fastify.put(
    "/:id/delete",
    { preHandler: [protectedRoute] },
    deleteCustomerController,
  );
}
