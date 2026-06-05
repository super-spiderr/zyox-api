import Fastify from "fastify";

const app = Fastify();

app.get("/", async () => {
  return { message: "Hello Zyox" };
});

export default app;
