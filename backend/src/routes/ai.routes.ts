import { Router } from "express";
import { getAISuggestions } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });
router.use(authenticate);
router.post("/ai-suggest", getAISuggestions);

export default router;
