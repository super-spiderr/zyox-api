import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/database";

const start = async () => {
  try {
    await connectDB();

    await app.listen({
      port: Number(process.env.PORT) || 3000,
      host: "0.0.0.0",
    });

    console.log("Server running on port 3000");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
