import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const protect = async (req, res, next) => {
  try {
    let token;

    // Prefer Authorization header: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.adminToken) {
      // fallback to cookie if you decide to set it
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify token safely; catch malformed tokens explicitly
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Auth Error:", err.message);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    // Attach admin to req
    const adminUser = await Admin.findById(decoded.id).select("-password");
    if (!adminUser) return res.status(401).json({ message: "Admin not found" });

    req.admin = adminUser;
    next();
  } catch (error) {
    console.error("Auth middleware unexpected error:", error);
    res.status(500).json({ message: "Server auth error" });
  }
};

export default protect;
