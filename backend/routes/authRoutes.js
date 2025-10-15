import express from "express";
import { postSignUp } from "../controllers/signUpController.js";
import { postLogin } from "../controllers/loginController.js";
import { refreshAccessToken } from "../controllers/refreshController.js";

const router = express.Router();

//POST (/auth) used since we are creating a user. Also sensitive info like email/pws are to be sent using body instead of URL queries.
router.post("/signup", postSignUp);     
router.post("/login", postLogin);
router.post("/refresh", refreshAccessToken);

export default router;