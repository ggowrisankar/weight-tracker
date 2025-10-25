import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export async function postLogin(req, res) {
  try {
    const { email, password } = req.body;
    
    //Validate Email/Password
    if (!email || !password) {
      return res.status(400).json({ error: "Email/Password is required" });
    }

    //Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "No user found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    //Creates a JWT: jwt.sign(payload, secret, options)
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },      //Payload: Data this token carries.
      process.env.JWT_SECRET,                   //Secret: Used to sign the token so the server can later verify it hasn’t been tampered with.
      { expiresIn: "1h" }                       //Options: Sets the token expiration time.
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, accessToken, refreshToken, user: { id: user._id, email: user.email } });
  }
  catch (err) {
    console.error("Login error: ",err.message);
    res.status(500).json({
      error: "Server Error",
      details: err.message
    });
  }
}