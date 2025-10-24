import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

console.log("🧠 Testing MongoDB connection...");

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ Connected successfully to MongoDB Atlas!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
