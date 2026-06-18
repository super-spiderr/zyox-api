import Fastify from "fastify";
import authRoutes from "./modules/auth/auth.route";
import customerRoutes from "./modules/customers/customer.route";

const app = Fastify();

app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(customerRoutes, { prefix: "/api/v1/customer" });
app.get("/", async () => {
  return { message: "Hello Zyox" };
});
export default app;
