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

// ------------------------
// Directory setup
// ------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ------------------------
// Public URL
// ------------------------
const PUBLIC_URL =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.FRONTEND_URL ||
  process.env.VITE_API_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

// ------------------------
// CORS setup
// ------------------------
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

if (!allowedOrigins.includes(PUBLIC_URL)) allowedOrigins.push(PUBLIC_URL);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`⚠️ CORS blocked: ${origin}`);
      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
  })
);

// ------------------------
// Body parsing
// ------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------
// Serve uploads (public)
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
// API Routes
// ------------------------
app.use("/api/registration", registrationRoutes);
app.use("/api/admin", adminRoutes);

// ------------------------
// Serve frontend static files
// ------------------------
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // Catch-all for SPA routes (non-API)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });

  console.log(`✅ Serving frontend from: ${frontendDist}`);
} else {
  console.log("ℹ️ Frontend build not found — API only mode.");
}

// ------------------------
// Root route (optional)
app.get("/", (req, res) => {
  res.send("🚀 Backend API running successfully");
});

// ------------------------
// Email test (optional)
app.get("/test-email", async (req, res) => {
  try {
    if (!process.env.SMTP_HOST) {
      return res.status(500).json({ success: false, error: "SMTP not configured" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "Email test",
      text: "Test successful",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email test error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------
// 404 Handler (API)
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// ------------------------
// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err?.message || err);
  res.status(500).json({ message: err?.message || "Server error" });
});

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on ${PUBLIC_URL} (port ${PORT})`);
});
