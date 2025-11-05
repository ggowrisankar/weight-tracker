import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true},
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

//Schema method to create a password reset token:
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");      //Generate a random 32-byte token in hexadecimal format

  //Hash the token using SHA-256 algorithm and store it in the user's document (ensures the actual token is not stored in plain text)
  this.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");    
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;      //Expiry: 10mins from now
  return rawToken;
};

export default mongoose.model("User", userSchema);