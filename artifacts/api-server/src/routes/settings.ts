import { Router, type IRouter } from "express";
import { UpdateSettingsBody } from "@workspace/api-zod";
import * as store from "../lib/store";
import { requireAuth } from "../lib/auth-middleware";

const router: IRouter = Router();

router.get("/settings", (_req, res) => {
  const settings = store.getSettings();
  res.json(settings);
});

router.put("/settings", requireAuth, (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const updated = store.updateSettings(parsed.data as store.SiteSettings);
  res.json(updated);
});

export default router;
