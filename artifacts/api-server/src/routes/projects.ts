import { Router, type IRouter } from "express";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
} from "@workspace/api-zod";
import * as store from "../lib/store";
import { requireAuth } from "../lib/auth-middleware";

const router: IRouter = Router();

router.get("/projects", (_req, res) => {
  const projects = store.getProjects();
  res.json(projects);
});

router.get("/projects/:id", (req, res) => {
  const parsed = GetProjectParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const project = store.getProject(parsed.data.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

router.post("/projects", requireAuth, (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const project = store.createProject(parsed.data as Omit<store.Project, "id">);
  res.status(201).json(project);
});

router.put("/projects/:id", requireAuth, (req, res) => {
  const paramsParsed = UpdateProjectParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const bodyParsed = UpdateProjectBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const updated = store.updateProject(paramsParsed.data.id, bodyParsed.data as Partial<store.Project>);
  if (!updated) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(updated);
});

router.delete("/projects/:id", requireAuth, (req, res) => {
  const parsed = DeleteProjectParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const deleted = store.deleteProject(parsed.data.id);
  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.status(204).send();
});

export default router;
