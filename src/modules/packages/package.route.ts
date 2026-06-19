import { FastifyInstance } from "fastify";
import { z } from "zod";
import { protectedRoute } from "../../middleware/auth.middleware";
import {
  createPackageController,
  deletePackageController,
  getPackageByIdController,
  getPackagesController,
  updatePackageController,
} from "./package.controller";
import { createPackageSchema, updatePackageSchema } from "./package.schema";
import { paginationQuerySchema } from "../common/common.schema";

export default async function packageRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Packages"],
        security: [{ bearerAuth: [] }],
        body: createPackageSchema,
      },
    },
    createPackageController,
  );
  fastify.get(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Packages"],
        security: [{ bearerAuth: [] }],
        querystring: paginationQuerySchema,
      },
    },
    getPackagesController,
  );
  fastify.get(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Packages"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    getPackageByIdController,
  );
  fastify.put(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Packages"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
        body: updatePackageSchema,
      },
    },
    updatePackageController,
  );
  fastify.delete(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["Packages"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    deletePackageController,
  );
}
