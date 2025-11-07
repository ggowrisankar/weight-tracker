import rateLimit from "express-rate-limit";

//Global rate limiter for all endpoint requests:
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,        //1min
  max: 100,                       //Limit each IP to 100 requests per min
  message: { message: "Too many requests from this IP. Please try again in a minute." },
});

//Rate limiter for email-verification related requests:
export const verificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,       //10mins
  max: 3,                         //Limit each IP to 3 requests per 10mins
  message: { message: "Too many verification requests attempted. Please try again later." },
  standardHeaders: true,          //Includes RateLimit-headers (Limit, Remaining, Reset) in responses to inform clients how many requests remain and when the limit resets
  legacyHeaders: false            //Disable old legacy headers (X-RateLimit-Limit, X-RateLimit-Remaining, etc.)
});

//Rate limiter for reset password requests:
export const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,       //10mins
  max: 5,                         //Limit each IP to 5 requests per 10mins
  message: { message: "Too many password reset requests attempted. Please try again later." },
  standardHeaders: true,          //Includes RateLimit-headers (Limit, Remaining, Reset) in responses to inform clients how many requests remain and when the limit resets
  legacyHeaders: false            //Disable old legacy headers (X-RateLimit-Limit, X-RateLimit-Remaining, etc.)
});