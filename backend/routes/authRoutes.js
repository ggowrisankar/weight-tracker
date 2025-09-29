import express from "express";
import { postSignUp } from "../controllers/signUpController.js";

const router = express.Router();

router.post("/signup", postSignUp);     //POST used since we are creating a user. Also sensitive info like email/pws are to be sent using body instead of URL queries.

export default router;