import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// ✅ Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "18250d" } // about 50 years
    );

    res.status(200).json({
      message: "Login successful",
      admin: { username: admin.username },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Send Email (for registration confirmation or announcements)
export const sendEmail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    // Ensure required fields
    if (!email || !subject || !message) {
      return res.status(400).json({ message: "Missing email details." });
    }

    // ✅ Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // ✅ Send the email
    await transporter.sendMail({
      from: `"Vision Africa Debate Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: message,
    });

    res.status(200).json({ message: "✅ Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    res.status(500).json({ message: "Email sending failed.", error });
  }
};
