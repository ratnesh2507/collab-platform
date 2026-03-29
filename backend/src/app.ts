import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import notificationRoutes, {
  activityRouter,
} from "./routes/notification.routes.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/projects/:projectId/activity", activityRouter);

app.get("/health", async (_req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  },
);

export default app;
