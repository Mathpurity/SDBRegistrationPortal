import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Registration from "../models/registrationModel.js";
import { getAllRegistration, confirmPayment } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Ensure uploads folder exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// ✅ Multer file upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Generate unique registration number
const generateRegNumber = () => {
  return "REG-" + Math.floor(100000 + Math.random() * 900000);
};

// ✅ Register a new school
router.post(
  "/register",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "receipt", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { schoolName, email, phone, coachName } = req.body;

      // ✅ Generate regNumber
      const regNumber = generateRegNumber();

      // ✅ File URLs (correct public paths)
      const logo = req.files.logo ? `/uploads/${req.files.logo[0].filename}` : "";
      const receipt = req.files.receipt ? `/uploads/${req.files.receipt[0].filename}` : "";

      // ✅ Save registration details
      const newRegistration = new Registration({
        regNumber,
        schoolName,
        coachName,
        email,
        phone,
        logo,
        receipt,
        status: "Pending",
      });

      await newRegistration.save();

      res.status(201).json({
        message: "✅ Registration successful! Await admin confirmation.",
        data: newRegistration,
      });
    } catch (error) {
      console.error("❌ Registration Error:", error);
      res.status(500).json({ message: "Server error. Try again later." });
    }
  }
);

// ✅ Get all registrations (for admin dashboard)
router.get("/", getAllRegistration);

// ✅ Confirm payment / approval
router.put("/confirm/:id", confirmPayment);

export default router;
