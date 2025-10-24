import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Registration from "../models/Registration.js";
import { getAllRegistration, confirmPayment } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Define file paths properly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

// ✅ Setup multer for logo & receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Registration endpoint
router.post(
  "/register",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "receipt", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { schoolName, coachName, email, phone, address, state, reason } = req.body;

      // ✅ Check for duplicate registration (by email)
      const existing = await Registration.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "❌ This email is already registered!" });
      }

      // ✅ Handle uploaded files
      const logo = req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : "";
      const receipt = req.files?.receipt ? `/uploads/${req.files.receipt[0].filename}` : "";

      // ✅ Create new registration
      const newRegistration = new Registration({
        schoolName,
        coachName,
        email,
        phone,
        address,
        state,
        reason,
        logo,
        receipt,
      });

      const saved = await newRegistration.save();

      res.status(201).json({
        message: "✅ Registration successful! Await admin confirmation.",
        data: saved,
      });
    } catch (error) {
      console.error("❌ Registration Error:", error);
      res.status(500).json({ message: "Server error. Try again later." });
    }
  }
);

// ✅ Get all registrations
router.get("/", getAllRegistration);

// ✅ Confirm payment
router.put("/confirm/:id", confirmPayment);

// ✅ Delete a registration and its files
router.delete("/:id", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "❌ Registration not found." });

    // ✅ Safely delete logo & receipt from uploads folder
    const deleteFile = (filePath) => {
      if (filePath) {
        const fullPath = path.join(__dirname, `../${filePath}`);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    };

    deleteFile(registration.logo);
    deleteFile(registration.receipt);
    await Registration.findByIdAndDelete(req.params.id);

    res.json({ message: "✅ Registration and related files deleted successfully." });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({ message: "Server error while deleting registration." });
  }
});

export default router;
