import express from "express";
import { loginAdmin } from "../controllers/authController.js";
import {
  getAllRegistration,
  confirmPayment,
  updateSchoolStatus,
  deleteSchool,
  sendEmail,
  getAllSchools,
} from "../controllers/adminController.js";
import protect from "../MiddleWare/AuthMiddleware.js";

const router = express.Router();

// Public: Admin login
router.post("/login", loginAdmin);

// Protected admin routes
router.get("/registrations", protect, getAllRegistration);

// Correct schools route (previously wrong)
router.get("/schools", protect, getAllSchools);

router.put("/confirm/:id", protect, confirmPayment);

router.put("/schools/status/:id", protect, updateSchoolStatus);

router.delete("/schools/:id", protect, deleteSchool);

router.post("/send-email", protect, sendEmail);

export default router;
