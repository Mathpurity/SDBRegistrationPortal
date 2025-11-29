import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Registration from "../models/Registration.js";

const router = express.Router();

// ------------------------
// Directory setup for uploads
// ------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ------------------------
// Multer storage config
// ------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// ------------------------
// Helper to form correct URLs for Render
// ------------------------
const getBaseUrl = (req) => {
  return process.env.RENDER_EXTERNAL_URL || process.env.VITE_API_URL || `http://localhost:5000`;
};

const formatRegistration = (reg, baseUrl) => ({
  ...reg._doc,
  logo: reg.logo ? `${baseUrl}${reg.logo}` : "",
  receipt: reg.receipt ? `${baseUrl}${reg.receipt}` : "",
});

// ------------------------
// POST: Register a school
// ------------------------
router.post(
  "/register",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "receipt", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const baseUrl = getBaseUrl(req);

      const { schoolName, coachName, email, phone, address, state, reason } = req.body;

      // Prevent double registration by email
      const existing = await Registration.findOne({ email });
      if (existing)
        return res.status(400).json({ message: "❌ This email is already registered!" });

      // Uploads
      const logo = req.files?.logo ? `/uploads/${req.files.logo[0].filename}` : "";
      const receipt = req.files?.receipt ? `/uploads/${req.files.receipt[0].filename}` : "";

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
        status: "Pending",
      });

      const saved = await newRegistration.save();
      res.status(201).json({
        message: "✅ Registration successful! Await admin approval.",
        data: formatRegistration(saved, baseUrl),
      });
    } catch (error) {
      console.error("❌ Registration Error:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  }
);

// ------------------------
// GET: All registrations
// ------------------------
router.get("/", async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    const registrations = await Registration.find().sort({ dateRegistered: -1 });
    const formatted = registrations.map((reg) => formatRegistration(reg, baseUrl));

    res.status(200).json({
      message: "✅ Registrations fetched successfully.",
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching registrations:", error);
    res.status(500).json({ message: "Server error while fetching registrations." });
  }
});

// ------------------------
// DELETE: Remove registration
// ------------------------
router.delete("/:id", async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration)
      return res.status(404).json({ message: "❌ Registration not found." });

    const deleteFile = (filePath) => {
      if (!filePath) return;
      const fullPath = path.join(__dirname, "../", filePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    };

    deleteFile(registration.logo);
    deleteFile(registration.receipt);

    await registration.deleteOne();

    res.status(200).json({
      message: "✅ Registration and files deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({ message: "Server error while deleting registration." });
  }
});

export default router;
