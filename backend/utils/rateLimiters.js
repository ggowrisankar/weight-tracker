import rateLimit from "express-rate-limit";

console.warn("⚠️ IPv6 warning from express-rate-limit is safe to ignore — using custom keyGenerator.");

//Global rate limiter for all endpoint requests:
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,        //1min
  max: 100,                       //Limit each IP to 100 requests per min
  message: { message: "Too many requests from this IP. Please try again in a minute." }
});

//Rate limiter for email-verification related requests:
export const verificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,       //10mins
  max: 3,                         //Limit each IP to 3 requests per 10mins
  message: { message: "Too many verification requests attempted. Please try again later." },  //Using object (instead of string) so client gets json, not plain text
  standardHeaders: true,          //Includes RateLimit-headers (Limit, Remaining, Reset) in responses to inform clients how many requests remain and when the limit resets
  legacyHeaders: false,           //Disable old legacy headers (X-RateLimit-Limit, X-RateLimit-Remaining, etc.)

  handler: (req, res, next, options) => { //Triggered when a client exceeds the allowed request limit; logs the IP and returns a 429 response with the configured message
    console.log("Rate limit hit for IP:", req.ip);
    res.status(options.statusCode).json(options.message); //Will be the same as 'message'
  },

  keyGenerator: (req, res) => {        //Use the client's real IP (from x-forwarded-for if behind a proxy, otherwise req.ip) to uniquely identify the requester for rate limiting
    return req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
  },
});

//Rate limiter for reset password requests:
export const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,       //10mins
  max: 5,                         //Limit each IP to 5 requests per 10mins
  message: { message: "Too many password reset requests attempted. Please try again later." },  //Using object (instead of string) so client gets json, not plain text
  standardHeaders: true,          //Includes RateLimit-headers (Limit, Remaining, Reset) in responses to inform clients how many requests remain and when the limit resets
  legacyHeaders: false,           //Disable old legacy headers (X-RateLimit-Limit, X-RateLimit-Remaining, etc.)

  handler: (req, res, next, options) => { //Triggered when a client exceeds the allowed request limit; logs the IP and returns a 429 response with the configured message
    console.log("Rate limit hit for IP:", req.ip);
    res.status(options.statusCode).json(options.message); //Will be the same as 'message'
  },

  keyGenerator: (req, res) => {        //Use the client's real IP (from x-forwarded-for if behind a proxy, otherwise req.ip) to uniquely identify the requester for rate limiting
    return req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
  },
});