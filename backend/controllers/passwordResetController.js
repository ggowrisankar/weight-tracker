import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { sendEMail } from "../utils/sendEmail.js";

//POST /request-password-reset - To send the reset password link to the user
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    //Always respond success to prevent email enumeration
    if (!user) return res.status(200).json({ message: "If an account exists, a reset link has been sent to your email." });

    /*Prevents multiple request triggers for the same user within the token validity window (10 mins) [Skipping since if the email sending failed, it would still read from the resetPasswordToken and resetPasswordExpires (since the fields are getting set as soon as the forget pw button is clicked)]
    if (user.resetPasswordToken && user.resetPasswordExpires > Date.now()) {
      return res.status(429).json({ message: "Password reset already requested. Please check your email or try again later." });
    }*/

    //Require verified users only [Skipping since it might also block legitimate users from ever accessing their account if pw is lost]
    //if (!user.isVerified) return res.status(400).json({ message: "Please verify your email before resetting password." });

    const resetPasswordToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });               //[Optional] Skip validation for this save since we’re only updating specific fields (like reset token)

    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetPasswordToken}&email=${encodeURIComponent(email)}`;   //Escapes special characters

    const message = `
      <h2>Password Reset for your account</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to set a new password:</p>
      <a href="${resetPasswordUrl}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEMail(user.email, "Password Reset Request", message);

    res.status(200).json({ success: true, message: "If an account exists, a reset link has been sent to your email." });
  }
  catch (err) {
    console.log("Resetting password link error: ", err);
    res.status(500).json({ error: "Error sending password reset email" });
  }
}

//POST /reset-password/:token - To update the new password and invalidate resetting token
export async function resetPassword(req, res) {
  try {
    const { email, password } = req.body;
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }     //Valid only if token expiry time (resetPasswordExpires) is greater than current time (hasn't expired yet)
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);

    //Update user fields with new password and invalidate existing token and expiry
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful. You can now log in." });
  }
  catch (err) {
    console.log("Resetting password error: ", err);
    res.status(500).json({ error: "Error resetting password" });
  }
}