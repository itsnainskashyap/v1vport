import type { Request, Response, NextFunction } from "express";
import { isValidToken } from "./store";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization required" });
    return;
  }
  const token = authHeader.slice(7);
  if (!isValidToken(token)) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  next();
}
