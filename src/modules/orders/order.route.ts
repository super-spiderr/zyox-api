import { FastifyInstance } from "fastify";
import { z } from "zod";
import { protectedRoute } from "../../middleware/auth.middleware";
import {
  createOrderController,
  deleteOrderController,
  getOrderByIdController,
  getOrdersController,
  updateOrderController,
} from "./order.controller";
import { createOrderSchema, updateOrderSchema } from "./order.schema";
import { paginationQuerySchema } from "../common/common.schema";

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        body: createOrderSchema,
      },
    },
    createOrderController,
  );
  fastify.get(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        querystring: paginationQuerySchema,
      },
    },
    getOrdersController,
  );
  fastify.get(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    getOrderByIdController,
  );
  fastify.put(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
        body: updateOrderSchema,
      },
    },
    updateOrderController,
  );
  fastify.delete(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Orders"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    deleteOrderController,
  );
}
