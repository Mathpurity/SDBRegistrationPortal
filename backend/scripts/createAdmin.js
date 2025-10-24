import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import connectDB from "../config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne({ username: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log("✅ Admin already exists");
      process.exit();
    }

    // ❌ Don't hash manually — let the model pre-save hook handle it
    const admin = await Admin.create({
      username: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });

    console.log("🎉 Admin created successfully:", admin);
    process.exit();
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
