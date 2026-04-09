import { Router, type IRouter } from "express";
import { AdminLoginBody, AdminVerifyBody } from "@workspace/api-zod";
import { verifyPassword, generateToken, storeToken, isValidToken } from "../lib/store";

const router: IRouter = Router();

router.post("/auth/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { password } = parsed.data;
  if (!verifyPassword(password)) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = generateToken();
  storeToken(token);
  res.json({ token, success: true });
});

router.post("/auth/verify", (req, res) => {
  const parsed = AdminVerifyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { token } = parsed.data;
  res.json({ valid: isValidToken(token) });
});

export default router;
