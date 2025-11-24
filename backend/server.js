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
// CORS
// ------------------------
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // mobile apps / Postman allowed
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error(`CORS blocked: ${origin} not allowed`), false);
      }
      return callback(null, true);
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
  const frontendDistPath =
    process.env.FRONTEND_DIST_PATH || path.join(__dirname, "../frontend/dist");

  app.use(express.static(frontendDistPath));

  // SPA fallback for React Router (all paths except /api/*)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
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
  const host =
    process.env.NODE_ENV === "production"
      ? new URL(process.env.VITE_API_URL).host
      : `localhost:${process.env.PORT || 5000}`;

  res.json({
    message: "Uploads folder served",
    testImageExample: `http://${host}/uploads/example.png`,
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
      text: "Test email successful",
    });

    res.json({ success: true });
  } catch (err) {
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
// Start server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
