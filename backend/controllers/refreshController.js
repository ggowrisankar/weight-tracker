import jwt from "jsonwebtoken";

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