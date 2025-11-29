import Admin from "../models/Admin.js";
import Registration from "../models/Registration.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const API_URL = process.env.FRONTEND_URL || "http://localhost:5000";

/* ==============================
   HELPER: Format registration data
============================== */
const formatRegistration = (registration) => ({
  ...registration._doc,
  logo: registration.logo ? `${API_URL}${registration.logo}` : "",
  receipt: registration.receipt ? `${API_URL}${registration.receipt}` : "",
});

/* ==============================
   CONFIRM PAYMENT
============================== */
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id);
    if (!registration) return res.status(404).json({ message: "Registration not found." });

    if (registration.status === "Confirmed") {
      return res.status(400).json({ message: "Payment already confirmed." });
    }

    registration.status = "Confirmed";
    await registration.save();

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"Vision Africa School Debate 2026" <${process.env.SMTP_USER}>`,
      to: registration.email,
      subject: "Payment Confirmation - School Debate Registration",
      html: `
        <p>Dear <strong>${registration.schoolName}</strong>,</p>
        <p>Your payment has been confirmed. Congratulations! 🎉</p>
        <p>You are now officially registered for the School Debate Competition.</p>
        <p>Further details will be shared soon.</p>
        <p>Thank you!</p>
      `,
    });

    res.status(200).json({
      message: "✅ Payment confirmed and confirmation email sent.",
      data: formatRegistration(registration),
    });
  } catch (err) {
    console.error("❌ Error confirming payment:", err);
    res.status(500).json({ message: "Server error confirming payment", error: err.message });
  }
};

/* ==============================
   GET ALL REGISTRATIONS
============================== */
export const getAllRegistration = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ dateRegistered: -1 });
    const formatted = registrations.map(formatRegistration);
    res.status(200).json({ message: "✅ Registrations fetched successfully.", data: formatted });
  } catch (error) {
    console.error("❌ Error fetching registrations:", error);
    res.status(500).json({ message: "Server error while fetching registrations." });
  }
};

/* ==============================
   UPDATE SCHOOL STATUS
============================== */
export const updateSchoolStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });

    const validStatuses = ["Pending", "Confirmed", "Approved", "Rejected", "Disapproved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
    }

    const updatedSchool = await Registration.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedSchool) return res.status(404).json({ message: "School not found" });

    res.status(200).json({ message: `✅ School status updated to '${status}' successfully.`, data: formatRegistration(updatedSchool) });
  } catch (error) {
    console.error("❌ Error updating school status:", error);
    res.status(500).json({ message: "Server error updating school status", error: error.message });
  }
};

/* ==============================
   DELETE SCHOOL (with file cleanup)
============================== */
export const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    if (!registration) return res.status(404).json({ message: "School not found" });

    const deleteFileIfExists = (filePath) => {
      if (!filePath) return;
      const fullPath = path.join(process.cwd(), filePath.replace(/\\/g, "/"));
      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
          if (err) console.error("⚠️ Error deleting file:", fullPath, err.message);
          else console.log(`🗑️ Deleted file: ${fullPath}`);
        });
      }
    };

    deleteFileIfExists(registration.logo);
    deleteFileIfExists(registration.receipt);

    await registration.deleteOne();

    res.status(200).json({ message: "✅ School and related files deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting school:", error);
    res.status(500).json({ message: "Error deleting school", error: error.message });
  }
};

/* ==============================
   SIMPLE PAYMENT CONFIRMATION STATUS
============================== */
export const confirmPaymentStatus = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Registration not found." });

    registration.status = "Confirmed";
    await registration.save();

    res.json({ message: "✅ Payment confirmed successfully!", data: formatRegistration(registration) });
  } catch (error) {
    console.error("❌ Error confirming payment:", error);
    res.status(500).json({ message: "Server error while confirming payment." });
  }
};

/* ==============================
   SEND EMAIL (No Attachment)
============================== */
export const sendEmail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) return res.status(400).json({ message: "Missing required fields" });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ message: "SMTP credentials missing. Verify .env." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({ from: `"Vision Africa Debate Team" <${process.env.SMTP_USER}>`, to: email, subject, html: message });

    res.status(200).json({ message: `✅ Email sent successfully to ${email}` });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ message: "Server error while sending email.", error: error.message });
  }
};
