import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  joinProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All routes require auth — applied once here, not per-route
router.use(authenticate);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectId", getProject);
router.post("/join/:inviteToken", joinProject);
router.patch("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

export default router;
