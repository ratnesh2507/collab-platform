import { Router } from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  batchDeleteTasks,
} from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", createTask);
router.delete("/batch", batchDeleteTasks);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);
router.patch("/:taskId/move", moveTask);

export default router;
