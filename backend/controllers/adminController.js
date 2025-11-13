import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Registration from "../models/Registration.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* ==============================
   CONFIRM PAYMENT
============================== */
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findByIdAndUpdate(
      id,
      { status: "Confirmed" },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

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

    console.log(`✅ Payment confirmed and email sent to ${registration.email}`);

    res.status(200).json({
      message: "✅ Payment confirmed and confirmation email sent.",
      data: registration,
    });
  } catch (err) {
    console.error("❌ Error confirming payment:", err);
    res.status(500).json({
      message: "Server error confirming payment",
      error: err.message,
    });
  }
};



/* ==============================
   GET ALL REGISTRATIONS
============================== */
export const getAllRegistration = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ dateRegistered: -1 });
    res.status(200).json(registrations);
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

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["Pending", "Confirmed", "Approved", "Rejected", "Disapproved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const updatedSchool = await Registration.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedSchool) {
      return res.status(404).json({ message: "School not found" });
    }

    res.status(200).json({
      message: `✅ School status updated to '${status}' successfully.`,
      data: updatedSchool,
    });
  } catch (error) {
    console.error("❌ Error updating school status:", error);
    res.status(500).json({
      message: "Server error updating school status",
      error: error.message,
    });
  }
};


/* ==============================
   DELETE SCHOOL (with file cleanup)
============================== */
import fs from "fs";
import path from "path";

export const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({ message: "School not found" });
    }

    // 🧹 Define helper to safely delete a file if it exists
    const deleteFileIfExists = (filePath) => {
      if (!filePath) return;
      const fullPath = path.join(process.cwd(), filePath.replace(/\\/g, "/"));
      fs.unlink(fullPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("⚠️ Error deleting file:", fullPath, err.message);
        } else {
          console.log(`🗑️ Deleted file: ${fullPath}`);
        }
      });
    };

    // 🧾 Delete logo and receipt if they exist
    deleteFileIfExists(registration.logo);
    deleteFileIfExists(registration.receipt);

    // 🧠 Delete from database
    await registration.deleteOne();

    res.status(200).json({ message: "✅ School and related files deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting school:", error);
    res.status(500).json({
      message: "Error deleting school",
      error: error.message,
    });
  }
};


/* ==============================
   SIMPLE PAYMENT CONFIRMATION STATUS
============================== */
export const confirmPaymentStatus = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found." });
    }

    registration.status = "Confirmed";
    await registration.save();

    res.json({ message: "✅ Payment confirmed successfully!", registration });
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

    if (!email || !subject || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔍 Log environment details for debugging
    console.log("📧 SMTP config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      secure: process.env.SMTP_SECURE,
    });

    // 🧠 Check if all SMTP credentials exist
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        message: "SMTP credentials are missing. Please verify .env configuration.",
      });
    }

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
      from: `"Vision Africa Debate Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: message,
    });

    console.log(`✅ Email successfully sent to ${email}`);
    res.status(200).json({ message: "✅ Email sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({
      message: "Server error while sending email.",
      error: error.message,
    });
  }
};
