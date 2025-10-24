import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

// ✅ Ensure 'uploads' folder exists
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ✅ Enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// ✅ Parse JSON & form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files with correct CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    // Allow local frontend to display images
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsDir)
);

// ✅ Routes
app.use("/api/registration", registrationRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Root route
app.get("/", (req, res) => res.send("🚀 Server running successfully"));

// ✅ Test route for debugging uploads
app.get("/uploads-check", (req, res) => {
  res.json({
    message: "Uploads folder served successfully",
    uploadsDir,
    testImageExample: `http://localhost:${PORT || 5000}/uploads/example.png`,
  });
});

// ✅ Handle 404s
app.use((req, res) => res.status(404).json({ message: "❌ Route not found" }));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📂 Uploads available at: http://localhost:${PORT}/uploads`);
});