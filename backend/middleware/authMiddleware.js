//This middleware function checks if the incoming HTTP request has a valid JWT token in the Authorization header. If the token is valid, it extracts user info and allows the request to continue. If not, it rejects the request with an error.
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res ,next) => {
  const authHeader = req.headers.authorization;
  /*Format req.headers: {
  "host": "api.example.com",
  "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MmYxMjM0NTY3ODkwYWJjZDEyMyIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpYXQiOjE2OTY0MDAwMDAsImV4cCI6MTY5NjQwMzYwMH0.l3fQ24qv3FG0hGcT__4qRVxyv3HX2syJ6ePvEMGrfBQ",
  "content-type": "application/json"
  }*/

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];                           //Gets the token string

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);      //Fetches the payload of token after verification is success (payload is created in the login section)
    req.user = { id: decoded.id, email: decoded.email };            //Attach user info to the request
    next();                                                         //Pass control to the next middleware or route handler
  }
  catch (err) {
    console.log("Token error: ", err);
    return res.status(401).json({ error: "Invalid Token" });        //Returning since its a middleware and don't want the flow to continue
  }
};