import Fastify from "fastify";
import authRoutes from "./modules/auth/auth.route";

const app = Fastify();

app.register(authRoutes, { prefix: "/api/v1/auth" });

app.get("/", async () => {
  return { message: "Hello Zyox" };
});
export default app;
