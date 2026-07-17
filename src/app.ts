import Fastify, { FastifyError } from "fastify";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform, ZodTypeProvider } from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";

import authRoutes from "./modules/auth/auth.route";
import customerRoutes from "./modules/customers/customer.route";
import categoryRoutes from "./modules/categories/category.route";
import productRoutes from "./modules/products/product.route";
import packageRoutes from "./modules/packages/package.route";
import orderRoutes from "./modules/orders/order.route";
import dashboardRoutes from "./modules/dashboard/dashboard.route";
import { getAllowedOrigins } from "./config/env";

const app = Fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: getAllowedOrigins(),
});

app.setErrorHandler((error: FastifyError, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      message: "Validation failed",
      errors: error.issues,
    });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return reply.status(400).send({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return reply.status(400).send({
      success: false,
      message: "Invalid identifier",
    });
  }

  if ((error as any).code === 11000) {
    return reply.status(409).send({
      success: false,
      message: "Duplicate resource",
    });
  }

  const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
  if (statusCode >= 500) {
    app.log.error(error);
  }

  return reply.status(statusCode).send({
    success: false,
    message: statusCode >= 500 ? "Internal server error" : error.message,
  });
});

// Register Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Zyox API Documentation",
      description: "Auto-generated API documentation using fastify-type-provider-zod",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

// Register Swagger UI
app.register(fastifySwaggerUi, {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
});

app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(customerRoutes, { prefix: "/api/v1/customer" });
app.register(categoryRoutes, { prefix: "/api/v1/category" });
app.register(productRoutes, { prefix: "/api/v1/product" });
app.register(packageRoutes, { prefix: "/api/v1/package" });
app.register(orderRoutes, { prefix: "/api/v1/order" });
app.register(dashboardRoutes, { prefix: "/api/v1/dashboard" });

app.get("/", async () => {
  return { message: "Hello Zyox" };
});

export default app;
