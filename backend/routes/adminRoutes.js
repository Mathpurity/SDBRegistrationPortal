import express from "express";
import { loginAdmin } from "../controllers/authController.js";
import {
  getAllRegistration,
  confirmPayment,
  updateSchoolStatus,
  deleteSchool,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Admin Login
router.post("/login", loginAdmin);

// 🧾 Protected Admin Actions
router.get("/registrations", protect, getAllRegistration);
router.put("/confirm/:id", protect, confirmPayment);


// ✅ Dashboard functionality
router.get("/schools", protect, getAllRegistration); // replaced getAllSchools
router.put("/schools/status/:id", protect, updateSchoolStatus);
router.delete("/schools/:id", protect, deleteSchool);

// ✅ Send Email (No Attachment)
import { sendEmail } from "../controllers/adminController.js";

router.post("/send-email", protect, sendEmail);

export default router;
