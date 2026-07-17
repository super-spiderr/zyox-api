import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/database";
import { validateEnv } from "./config/env";

const start = async () => {
  try {
    validateEnv();
    await connectDB();

    const port = Number(process.env.PORT) || 3000;
    await app.listen({
      port: port,
      host: "0.0.0.0",
    });

    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
