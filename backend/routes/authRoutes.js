import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { verificationLimiter, resetPasswordLimiter  } from "../utils/rateLimiters.js";
import { postSignUp, postLogin, refreshAccessToken, getUserDetails } from "../controllers/authController.js";
import { sendVerification, checkVerification } from "../controllers/verificationController.js";
import { requestPasswordReset, resetPassword } from "../controllers/passwordResetController.js";

const router = express.Router();

//POST (/auth) used since we are creating a user. Also sensitive info like email/pws are to be sent using body instead of URL queries.
router.post("/signup", postSignUp);     
router.post("/login", postLogin);
router.post("/refresh", refreshAccessToken);
router.get("/me", authMiddleware, getUserDetails);

router.post("/send-verification", authMiddleware, verificationLimiter, sendVerification);
router.get("/verify/:token", checkVerification);

router.post("/request-password-reset", resetPasswordLimiter, requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;