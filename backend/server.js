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
// FIX: Auto-detect Render URL
// ------------------------
const PUBLIC_URL =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.VITE_API_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

// ------------------------
// CORS setup
// ------------------------
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

allowedOrigins.push(PUBLIC_URL); // FIX FOR RENDER FRONTEND

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
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
// API Routes
// ------------------------
app.use("/api/registration", registrationRoutes);
app.use("/api/admin", adminRoutes);

// ------------------------
// Serve frontend in production
// ------------------------
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../frontend/dist");

  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));

    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(frontendDistPath, "index.html"));
    });
  }
}

// ------------------------
// Root route
// ------------------------
app.get("/", (req, res) => {
  res.send("🚀 Server running successfully");
});

// ------------------------
// Uploads check
// ------------------------
app.get("/uploads-check", (req, res) => {
  res.json({
    message: "Uploads folder served",
    urlExample: `${PUBLIC_URL}/uploads/example.png`,
  });
});

// ------------------------
// Email test
// ------------------------
app.get("/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
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
// 404 Handler
// ------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ------------------------
// Global error handler
// ------------------------
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  res.status(500).json({ message: err.message });
});

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PUBLIC_URL}`);
});
