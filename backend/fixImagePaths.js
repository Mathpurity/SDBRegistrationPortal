import mongoose from "mongoose";
import dotenv from "dotenv";
import Registration from "./models/Registration.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://visionafricafmradio_db_user:vM5KtlPFmksgPHFh@cluster000000.yidtu9m.mongodb.net/visionafricafmradio_db_user?retryWrites=true&w=majority";

async function fixImagePaths() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const registrations = await Registration.find();

    let updatedCount = 0;

    for (const reg of registrations) {
      let updated = false;

      // ✅ Fix logo path if missing 'uploads/'
      if (reg.logo && !reg.logo.startsWith("uploads/")) {
        reg.logo = `uploads/${reg.logo.replace(/^\/?uploads\//, "")}`;
        updated = true;
      }

      // ✅ Fix receipt path if missing 'uploads/'
      if (reg.receipt && !reg.receipt.startsWith("uploads/")) {
        reg.receipt = `uploads/${reg.receipt.replace(/^\/?uploads\//, "")}`;
        updated = true;
      }

      if (updated) {
        await reg.save();
        updatedCount++;
      }
    }

    console.log(`✅ Fixed ${updatedCount} record(s) successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing image paths:", error);
    process.exit(1);
  }
}

fixImagePaths();
