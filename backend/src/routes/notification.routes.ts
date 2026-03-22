import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getActivity,
} from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/", getNotifications);
// Static route before dynamic to avoid any potential Express matching ambiguity
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;

export const activityRouter = Router({ mergeParams: true });
activityRouter.use(authenticate);
activityRouter.get("/", getActivity);
