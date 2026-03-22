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

// All routes require auth
router.use(authenticate);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectId", getProject);
router.post("/join/:inviteToken", joinProject);
router.patch("/:projectId", authenticate, updateProject);
router.delete("/:projectId", authenticate, deleteProject);

export default router;
