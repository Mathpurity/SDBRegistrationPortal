import express from "express";
import { loginAdmin } from "../controllers/authController.js";
import {
  getAllRegistration,
  confirmPayment,
  updateSchoolStatus,
  deleteSchool,
  sendEmail, // ✅ kept intact
} from "../controllers/adminController.js";
import protect from "../MiddleWare/AuthMiddleware.js";

const router = express.Router();

// 🔐 Admin Login
router.post("/login", loginAdmin);

// 🧾 Protected Admin Actions
router.get("/registrations", protect, getAllRegistration);
router.put("/confirm/:id", protect, confirmPayment);

// ✅ Dashboard Management Routes
router.get("/schools", protect, getAllRegistration);
router.put("/schools/status/:id", protect, updateSchoolStatus);
router.delete("/schools/:id", protect, deleteSchool);

// ✅ Email Sending Route (No Attachments)
router.post("/send-email", protect, sendEmail);

export default router;
