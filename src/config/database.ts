import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri, {
        dbName: "zyox",
      });
      console.log("MongoDB Connected");
    } else {
      throw new Error("Mongo URL not found");
    }
  } catch (error) {
    console.log("DB connection failed", error);
    process.exit(1);
  }
};
