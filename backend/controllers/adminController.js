import Registration from "../models/Registration.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || "";

/** return absolute URL for uploads stored like "/uploads/filename" or "uploads/filename" */
const getPublicUrl = (filePath) => {
  if (!filePath) return "";
  // ensure leading slash
  const normalized = filePath.startsWith("/") ? filePath : `/${filePath.replace(/^\/+/, "")}`;
  // if FRONTEND_URL points to backend host, it will build correct absolute URL
  if (FRONTEND_URL) {
    // FRONTEND_URL may be the frontend site; prefer backend origin when serving files.
    // If you expose backend origin via env (VITE_API_URL), it should be used; otherwise rely on path only.
    return `${FRONTEND_URL.replace(/\/$/, "")}${normalized}`;
  }
  return normalized;
};

const formatRegistration = (registration) => ({
  ...registration._doc,
  logo: registration.logo ? getPublicUrl(registration.logo) : "",
  receipt: registration.receipt ? getPublicUrl(registration.receipt) : "",
});

/* Confirm payment */
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

    // send email (if configured)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 465),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail({
          from: `"Vision Africa School Debate" <${process.env.SMTP_USER}>`,
          to: registration.email,
          subject: "Payment Confirmed",
          html: `<p>Dear <strong>${registration.schoolName}</strong>,</p><p>Your payment has been confirmed.</p>`,
        });
      } catch (mailErr) {
        console.warn("Mail warning:", mailErr.message);
      }
    }

    res.status(200).json({ message: "Payment confirmed.", data: formatRegistration(registration) });
  } catch (err) {
    console.error("Error confirming payment:", err);
    res.status(500).json({ message: "Server error confirming payment", error: err.message });
  }
};

export const getAllRegistration = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ dateRegistered: -1 });
    const formatted = registrations.map(formatRegistration);
    res.status(200).json({ message: "Registrations fetched successfully.", data: formatted });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Server error while fetching registrations." });
  }
};

export const updateSchoolStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const validStatuses = ["Pending", "Confirmed", "Approved", "Rejected", "Disapproved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
    }

    const updated = await Registration.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "School not found" });

    res.status(200).json({ message: "Status updated", data: formatRegistration(updated) });
  } catch (error) {
    console.error("Error updating school status:", error);
    res.status(500).json({ message: "Server error updating school status", error: error.message });
  }
};

export const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    if (!registration) return res.status(404).json({ message: "School not found" });

    // Delete files safely
    const deleteFile = (fp) => {
      if (!fp) return;
      const full = path.join(process.cwd(), fp.replace(/^\/+/, ""));
      if (fs.existsSync(full)) {
        fs.unlink(full, (err) => {
          if (err) console.error("Error deleting file:", full, err.message);
        });
      }
    };
    deleteFile(registration.logo);
    deleteFile(registration.receipt);

    await registration.deleteOne();
    res.status(200).json({ message: "School deleted" });
  } catch (error) {
    console.error("Error deleting school:", error);
    res.status(500).json({ message: "Error deleting school", error: error.message });
  }
};

export const confirmPaymentStatus = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Registration not found." });
    registration.status = "Confirmed";
    await registration.save();
    res.json({ message: "Payment confirmed", data: formatRegistration(registration) });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Server error while confirming payment." });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) return res.status(400).json({ message: "Missing required fields" });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ message: "SMTP credentials missing. Verify .env." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"Vision Africa Debate Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: message,
    });

    res.status(200).json({ message: `Email sent successfully to ${email}` });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Server error while sending email.", error: error.message });
  }
};
