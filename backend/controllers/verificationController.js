import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { sendEMail } from "../utils/sendEmail.js";

//POST /send-verification - To send the email verification link to the user
export async function sendVerification(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(200).json({ message: "User already verified" });

    const verificationToken = jwt.sign(
      { id: user._id, type: "email_verify" },
      process.env.EMAIL_VERIFY_SECRET,
      { expiresIn: "24h" }
    );

    const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${verificationToken}`;

    const message = `
      <h2>Welcome to Keepr Weight Tracker!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}">Verify My Email</a>
      <p>This link will expire in 24hrs.</p>
    `;

    await sendEMail(user.email, "Verify your account", message);

    res.status(200).json({ success: true, message: "Verification email sent" });
  }
  catch (err) {
    console.error("Verification error: ", err.message);
    res.status(500).json({
      error: "Server Error",
      details: err.message
    });
  } 
}

//GET /verify/:token - To ensure user is "verified" after clicking on link
export async function checkVerification(req, res) {
  try {
    const decoded = jwt.verify(req.params.token, process.env.EMAIL_VERIFY_SECRET);

    if (decoded.type !== "email_verify") return res.status(400).json({ message: "Invalid token type" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(200).json({ message: "User already verified" });

    user.isVerified = "true";
    await user.save();

    res.json({ message: "Verified!" });
  }
  catch (err) {
    console.error("Verification link error:", err.message);
    res.status(500).json({
      error: "Server Error",
      details: err.message
    });
  }
}