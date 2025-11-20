import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import nodemailer from "nodemailer";

dotenv.config();
connectDB();

const app = express();

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

// Ensure 'uploads' folder exists
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Parse JSON & URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files with proper CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsDir)
);

// Routes
app.use("/api/registration", registrationRoutes);
app.use("/api/admin", adminRoutes);

// Root route
app.get("/", (req, res) => res.send("🚀 Server running successfully"));

// PORT
const PORT = process.env.PORT || 5000;

// Upload test route
app.get("/uploads-check", (req, res) => {
  res.json({
    message: "Uploads folder served successfully",
    uploadsDir,
    testImageExample: `http://localhost:${PORT}/uploads/example.png`,
  });
});

// Email test route — corrected transport
app.get("/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 5000,
      secure: process.env.SMTP_SECURE === "true", // Convert string to boolean
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "✅ Vision Africa Email Test",
      text: "If you received this, your email setup works perfectly!",
    });

    res.json({ success: true, message: "✅ Test email sent successfully" });
  } catch (err) {
    console.error("❌ Email test failed:", err);
    res.status(500).json({
      success: false,
      message: "Email setup failed",
      error: err.message,
    });
  }
});

// Handle 404s
app.use((req, res) => res.status(404).json({ message: "❌ Route not found" }));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📂 Uploads available at: http://localhost:${PORT}/uploads`);
});
