import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform, ZodTypeProvider } from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import authRoutes from "./modules/auth/auth.route";
import customerRoutes from "./modules/customers/customer.route";
import categoryRoutes from "./modules/categories/category.route";
import productRoutes from "./modules/products/product.route";
import packageRoutes from "./modules/packages/package.route";

const app = Fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

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

app.get("/", async () => {
  return { message: "Hello Zyox" };
});

export default app;
