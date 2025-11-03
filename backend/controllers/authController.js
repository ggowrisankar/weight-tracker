import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

//POST /signup - Create new user
export async function postSignUp(req, res) {
  try {
    const { email, password } = req.body;

    //Validate Email/Password
    if (!email || !password) {
      return res.status(400).json({ error: "Email/Password is required" });
    }

    //Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ error: "User already exists" });
    }

    //Hash Password (bcrypt.hash returns a promise. Use await to resolve it.)
    const hashedPassword = await bcrypt.hash(password, 10);   //`10` is salt rounds for bcrypt encryption. Higher value > more secure but more time consumption.

    //Create new user
    const newUser = new User({ email, passwordHash: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  }
  catch (err) {
    console.error("Creation error: ", err.message);
    res.status(500).json({
      error: "Server Error",
      details: err.message
    });
  }
}

//POST /login - Login existing user
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

    res.json({ success: true, accessToken, refreshToken, user: { id: user._id, email: user.email, verified: user.isVerified } });
  }
  catch (err) {
    console.error("Login error: ", err.message);
    res.status(500).json({
      error: "Server Error",
      details: err.message
    });
  }
}

//POST /refresh - Create refresh access tokens
export async function refreshAccessToken(req, res) {
  const { token } = req.body;

  if (!token) return res.status(401).json({ error: "Missing refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken: newAccessToken, user: { id: decoded.id, email: decoded.email } });
  }
  catch (err) {
    console.error("Refresh token error: ", err.message);
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
}

//GET /me - Fetch the latest user document
export async function getUserDetails(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: { id: user._id, email: user.email, verified: user.isVerified } });
  }
  catch (err) {
    console.error("User details check error: ", err.message);
    res.status(500).json({
      error: "Server Error",
      details: err.message
    });
  }
}