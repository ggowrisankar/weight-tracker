import bcrypt from "bcrypt";
import User from "../models/user.js";

export async function postSignUp(req, res) {
  try {
    const { email, password } = req.body;

    //Validate Email/Password
    if (!email || !password) {
      return res.status(400).json({ error: "Email/Password is required." });
    }

    //Check if a user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    //Hash Password (bcrypt.hash returns a promise. Use await to resolve it.)
    const hashedPassword = await bcrypt.hash(password, 10);   //`10` is salt rounds for bcrypt encryption. Higher value > more secure but more time consumption.

    //Create new user
    const newUser = new User({ email, passwordHash: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  }
  catch (err) {
    console.error("Creation error: ",err.message);
    res.status(500).json({
      error: "Server Error",
      details: err.message
    });
  }
}