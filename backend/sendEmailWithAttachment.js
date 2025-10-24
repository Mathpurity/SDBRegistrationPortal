import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Registration from "../models/Registration.js";

dotenv.config();

export const sendEmailWithAttachment = async (req, res) => {
  try {
    const { email, subject, message, status } = req.body;
    const attachment = req.file;

    // ✅ Validate fields
    if (!email || !subject || !message) {
      return res.status(400).json({
        message: "Email, subject, and message are required.",
      });
    }

    // ✅ Fetch registration details (optional)
    const school = await Registration.findOne({ email });
    const dateRegistered = school?.dateRegistered
      ? new Date(school.dateRegistered).toLocaleDateString()
      : new Date().toLocaleDateString();
    const currentStatus = school?.status || status || "Pending";

    // ✅ Setup transporter (using environment variables)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // ✅ Build mail options
    const mailOptions = {
      from: `"Vision Africa Debate Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <p>Dear <strong>${email.split("@")[0]}</strong>,</p>
          <div>${message.replace(/\n/g, "<br>")}</div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

          <p><strong>Date of Registration:</strong> ${dateRegistered}</p>
          <p><strong>Status:</strong> 
            <span style="color: ${
              currentStatus.toLowerCase() === "approved"
                ? "green"
                : currentStatus.toLowerCase() === "rejected"
                ? "red"
                : "orange"
            };">
              ${currentStatus}
            </span>
          </p>

          <p style="margin-top: 20px;">Best regards,</p>
          <p><strong>Vision Africa Debate Team</strong></p>
        </div>
      `,
    };

    console.log("📎 Uploaded file:", req.file);


    // ✅ If file was uploaded, attach it
    if (attachment) {
      mailOptions.attachments = [
        {
          filename: attachment.originalname,
          content: attachment.buffer,
        },
      ];
    }

    // ✅ Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email} (Message ID: ${info.messageId})`);

    // ✅ Send response to frontend
    res.status(200).json({
      success: true,
      message: `📧 Email sent successfully to ${email}`,
      redirect: "/registration",
      info: info.response,
    });
  } catch (error) {
    console.error("❌ Email sending error:", error);

    // ✅ More specific feedback for frontend
    if (error.responseCode === 535) {
      return res.status(401).json({
        message: "Authentication failed. Check SMTP username/password.",
      });
    }

    if (error.code === "ENOTFOUND") {
      return res.status(502).json({
        message: "Mail server not reachable. Check SMTP host or internet connection.",
      });
    }

    return res.status(500).json({
      message: "Server error while sending email.",
      error: error.message,
    });
  }
};
