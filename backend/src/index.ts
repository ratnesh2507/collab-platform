import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { setupSocket } from "./socket/socket";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== "production";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

setupSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}${isDev ? ` (dev)` : ""}`);
});

export { io };
