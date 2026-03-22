import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import notificationRoutes, {
  activityRouter,
} from "./routes/notification.routes";
import { setupSocket } from "./socket/socket";

// Load env vars first before any other imports that use them
dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== "production";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/projects/:projectId/activity", activityRouter);

// Health check — verifies DB connectivity for Railway
app.get("/health", async (req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// Global error handler — catches any unhandled Express errors
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  },
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

setupSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}${isDev ? ` (dev)` : ""}`);
});

export { io };
