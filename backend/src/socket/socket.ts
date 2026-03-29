import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

const isDev = process.env.NODE_ENV !== "production";

// Typed event payloads
interface TaskEventPayload {
  projectId: string;
  task: {
    id: string;
    title: string;
    assigneeId: string | null;
  };
}

interface TaskDeletedPayload {
  projectId: string;
  taskId: string;
}

interface TaskMovedPayload {
  projectId: string;
  taskId: string;
  columnId: string;
  order: number;
}

interface TaskEditingPayload {
  projectId: string;
  taskId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    if (isDev) console.log("Client connected:", socket.id);

    // Join personal notification room
    socket.on("join-user", (userId: string) => {
      if (typeof userId === "string" && userId.length > 0) {
        socket.join(`user:${userId}`);
      }
    });

    // Join a project room
    socket.on("join-project", (projectId: string) => {
      socket.join(projectId);
      socket.to(projectId).emit("user-joined", { socketId: socket.id });
    });

    // Leave a project room
    socket.on("leave-project", (projectId: string) => {
      socket.leave(projectId);
      socket.to(projectId).emit("user-left", { socketId: socket.id });
    });

    // Task created
    socket.on("task-created", ({ projectId, task }: TaskEventPayload) => {
      socket.to(projectId).emit("task-created", task);
      if (task.assigneeId) {
        notifyAssignee(io, task, "assigned");
      }
    });

    // Task updated — only notify if assignee is set
    // Note: fires on every update but assignee may not have changed
    socket.on("task-updated", ({ projectId, task }: TaskEventPayload) => {
      socket.to(projectId).emit("task-updated", task);
      if (task.assigneeId) {
        notifyAssignee(io, task, "assigned");
      }
    });

    // Task deleted
    socket.on("task-deleted", ({ projectId, taskId }: TaskDeletedPayload) => {
      socket.to(projectId).emit("task-deleted", taskId);
    });

    // Task moved
    socket.on(
      "task-moved",
      ({ projectId, taskId, columnId, order }: TaskMovedPayload) => {
        socket.to(projectId).emit("task-moved", { taskId, columnId, order });
      },
    );

    // Task editing presence
    socket.on(
      "task-editing-start",
      ({ projectId, taskId, user }: TaskEditingPayload) => {
        socket.to(projectId).emit("task-editing-start", { taskId, user });
      },
    );

    socket.on(
      "task-editing-stop",
      ({ projectId, taskId, user }: TaskEditingPayload) => {
        socket.to(projectId).emit("task-editing-stop", { taskId, user });
      },
    );

    socket.on("disconnect", () => {
      if (isDev) console.log("Client disconnected:", socket.id);
    });
  });
}

async function notifyAssignee(
  io: Server,
  task: { id: string; title: string; assigneeId: string | null },
  type: string,
) {
  if (!task.assigneeId) return;

  try {
    const notification = await prisma.notification.create({
      data: {
        userId: task.assigneeId,
        message: `You were ${type} to task "${task.title}"`,
      },
    });
    // Emit to the assignee's personal room
    io.to(`user:${task.assigneeId}`).emit("notification", notification);
  } catch {
    // Notification failure should never crash the socket
  }
}
