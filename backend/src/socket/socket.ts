import { Server, Socket } from "socket.io";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // Join a project room
    socket.on("join-project", (projectId: string) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined project ${projectId}`);

      // Broadcast to others in the room that someone joined
      socket.to(projectId).emit("user-joined", {
        socketId: socket.id,
      });
    });

    // Leave a project room
    socket.on("leave-project", (projectId: string) => {
      socket.leave(projectId);
      socket.to(projectId).emit("user-left", {
        socketId: socket.id,
      });
    });

    // Task created
    socket.on("task-created", ({ projectId, task }: any) => {
      socket.to(projectId).emit("task-created", task);
    });

    // Task updated
    socket.on("task-updated", ({ projectId, task }: any) => {
      socket.to(projectId).emit("task-updated", task);
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
