import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import os from "os"; // ES Module import
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import nodemailer from "nodemailer";

dotenv.config();
connectDB();

const app = express();

// ------------------------
// Directory setup
// ------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ------------------------
// Allowed origins for CORS
// ------------------------
const allowedOrigins = [
  process.env.FRONTEND_URL, // Production frontend (Bluehost)
  "http://localhost:5173",   // Vite dev
  "http://localhost:3000",   // Optional dev port
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman or mobile apps
      if (!allowedOrigins.includes(origin)) {
        const msg = `❌ The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// ------------------------
// Parse JSON & URL-encoded
// ------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------
// Serve uploads
// ------------------------
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsDir)
);

// ------------------------
// Routes
// ------------------------
app.use("/api/registration", registrationRoutes);
app.use("/api/admin", adminRoutes);

// ------------------------
// Serve frontend in production
// ------------------------
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendDistPath));

  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendDistPath, "index.html"));
    } else {
      next();
    }
  });
}

// ------------------------
// Root route
// ------------------------
app.get("/", (req, res) => res.send("🚀 Server running successfully"));

// ------------------------
// Uploads test route
// ------------------------
app.get("/uploads-check", (req, res) => {
  const host = process.env.NODE_ENV === "production"
    ? new URL(process.env.VITE_API_URL).host // Render backend host in production
    : `localhost:${process.env.PORT || 5000}`;

  res.json({
    message: "Uploads folder served successfully",
    uploadsDir,
    testImageExample: `http://${host}/uploads/example.png`,
  });
});

// ------------------------
// Email test route
// ------------------------
app.get("/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 5000,
      secure: process.env.SMTP_SECURE === "true",
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

// ------------------------
// 404 handler
// ------------------------
app.use((req, res) => res.status(404).json({ message: "❌ Route not found" }));

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);

  const host = process.env.NODE_ENV === "production"
    ? new URL(process.env.VITE_API_URL).host
    : `localhost:${PORT}`;

  console.log(`📂 Uploads available at: http://${host}/uploads`);
});
