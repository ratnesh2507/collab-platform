import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-user", (userId: string) => {
      socket.join(`user:${userId}`);
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
    socket.on("task-created", ({ projectId, task }: any) => {
      socket.to(projectId).emit("task-created", task);
      // Notify assignee if assigned
      if (task.assigneeId) {
        notifyAssignee(io, task, projectId, "assigned");
      }
    });

    // Task updated
    socket.on("task-updated", ({ projectId, task }: any) => {
      socket.to(projectId).emit("task-updated", task);
      if (task.assigneeId) {
        notifyAssignee(io, task, projectId, "assigned");
      }
    });

    // Task deleted
    socket.on("task-deleted", ({ projectId, taskId }: any) => {
      socket.to(projectId).emit("task-deleted", taskId);
    });

    // Task moved
    socket.on("task-moved", ({ projectId, taskId, columnId, order }: any) => {
      socket.to(projectId).emit("task-moved", { taskId, columnId, order });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

async function notifyAssignee(
  io: Server,
  task: any,
  projectId: string,
  type: string,
) {
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
