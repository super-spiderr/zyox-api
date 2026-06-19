import { FastifyInstance } from "fastify";
import { z } from "zod";
import { protectedRoute } from "../../middleware/auth.middleware";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryController,
  updateCategoryController,
} from "./category.controller";
import { createCategorySchema, updateCategorySchema } from "./category.schema";
import { paginationQuerySchema } from "../common/common.schema";

export default async function categoryRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        body: createCategorySchema,
      },
    },
    createCategoryController,
  );
  fastify.get(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        querystring: paginationQuerySchema,
      },
    },
    getCategoryController,
  );
  fastify.put(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
        body: updateCategorySchema,
      },
    },
    updateCategoryController,
  );
  fastify.delete(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    deleteCategoryController,
  );
}
