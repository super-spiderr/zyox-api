import { FastifyInstance } from "fastify";
import { z } from "zod";
import { protectedRoute } from "../../middleware/auth.middleware";
import {
  createCustomerController,
  deleteCustomerController,
  getCustomerByIdController,
  getCustomersController,
  updateCustomerController,
} from "./customer.controller";
import { createCustomerSchema, updateCustomerSchema } from "./customer.schema";
import { paginationQuerySchema } from "../common/common.schema";

export default async function customerRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        body: createCustomerSchema,
      },
    },
    createCustomerController,
  );
  fastify.get(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        querystring: paginationQuerySchema.extend({
          id: z.string().optional(),
        }),
      },
    },
    getCustomersController,
  );
  fastify.get(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    getCustomerByIdController,
  );
  fastify.put(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
        body: updateCustomerSchema,
      },
    },
    updateCustomerController,
  );
  fastify.put(
    "/:id/delete",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    deleteCustomerController,
  );
}
