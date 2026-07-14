import { FastifyInstance } from "fastify";
import { z } from "zod";
import { protectedRoute } from "../../middleware/auth.middleware";
import {
  createProductController,
  deleteProductController,
  getProductByIdController,
  getProductController,
  updateProductController,
} from "./product.controller";
import { createProductSchema, updateProductSchema } from "./product.schema";
import { paginationQuerySchema } from "../common/common.schema";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        body: createProductSchema,
      },
    },
    createProductController,
  );
  fastify.get(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        querystring: paginationQuerySchema.extend({
          categoryId: z.string().optional(),
        }),
      },
    },
    getProductController,
  );
  fastify.get(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    getProductByIdController,
  );
  fastify.put(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
        body: updateProductSchema,
      },
    },
    updateProductController,
  );
  fastify.delete(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    deleteProductController,
  );
}
