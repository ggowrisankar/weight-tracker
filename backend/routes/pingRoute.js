import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  //Dev optional delay (for testing):
  //await new Promise(r => setTimeout(r, 10000));
  return res.json({ status: "ok" });
});

export default router;  