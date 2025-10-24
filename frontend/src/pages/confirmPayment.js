







export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findByIdAndUpdate(
      id,
      { status: "Confirmed" },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"Vision Africa School Debate 2026 (No Reply)" <${process.env.SMTP_USER}>`,
      to: registration.email,
      subject: "Payment Confirmation - School Debate Registration",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear <strong>${registration.schoolName}</strong>,</p>
          <p>Your payment has been <strong>confirmed</strong>. 🎉</p>
          <p>You are now officially registered for the <strong>Vision Africa School Debate 2026</strong>.</p>
          <p>Further details will be shared soon.</p>
          <br>
          <p>Thank you!</p>
          <p><strong>Vision Africa School Debate 2026 Team</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #777;">
            📢 This is an automated message sent from a no-reply address.<br>
            Please do not reply to this email. For inquiries, contact us at 
            <a href="mailto:info@visionafricaradioblog.com">info@visionafricaradioblog.com</a>.
          </p>
        </div>
      `,
    });

    console.log(`✅ Payment confirmed and email sent to ${registration.email}`);

    res.status(200).json({
      message: "✅ Payment confirmed and confirmation email sent.",
      data: registration,
    });
  } catch (err) {
    console.error("❌ Error confirming payment:", err);
    res.status(500).json({
      message: "Server error confirming payment",
      error: err.message,
    });
  }
};
